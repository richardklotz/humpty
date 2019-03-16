/* eslint camelcase: 0 */ // --> OFF

import fs from 'fs';
import express from 'express';
import session from 'express-session';
import compression from 'compression';
import passport from 'passport';
import next from 'next';
import lusca from 'lusca';
import cors from 'cors';
import yaml from 'js-yaml';
import connectDynamoDb from 'connect-dynamodb';
import * as beaverLogger from 'beaver-logger/server';
import Auth0Strategy from 'passport-auth0';
import nextConfig from '../../next.config';
import environmentConfigMiddleware from './environment-config-middleware';
import loadConfiguration from './load-configuration';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

export const createServer = (envVars, app) => {
	const strategy = new Auth0Strategy(
		{
			domain: envVars.AUTH0_DOMAIN,
			clientID: envVars.AUTH0_CLIENT_ID,
			clientSecret: envVars.AUTH0_CLIENT_SECRET,
			callbackURL:
				envVars.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback',
		},
		(accessToken, refreshToken, extraParams, profile, done) => {
			// accessToken is the token to call Auth0 API (not needed in the most cases)
			// extraParams.id_token has the JSON Web Token
			// profile has all the information from the user
			return done(null, profile);
		}
	);

	const server = express();
	const handle = app.getRequestHandler();

	server.use(compression());
	server.use(cors());
	server.use(environmentConfigMiddleware(envVars));
	passport.use(strategy);

	server.use(passport.initialize());
	server.use(passport.session());

	const dynamoDbOptions = {
		table: 'humpty-ui-sessions',
		readCapacityUnits: 25,
		writeCapacityUnits: 25,
	};

	const DynamoDBStore = connectDynamoDb({session});

	server.use(
		session({
			secret: '32342423423423424rfsdfswer34',
			store: new DynamoDBStore(dynamoDbOptions),
			resave: false,
			saveUninitialized: false,
			name: 'humpty.ui.connect.sid',
		})
	);

	server.use(
		lusca({
			csrf: false,
			csp: null,
			hsts: {maxAge: 31536000, includeSubDomains: true, preload: true},
			xssProtection: true,
			nosniff: true,
		})
	);

	server.get(
		'/login',
		passport.authenticate('auth0', {
			scope: 'openid email profile',
		}),
		(req, res) => {
			res.redirect('/');
		}
	);

	server.get('/callback', (req, res, next) => {
		passport.authenticate('auth0', (err, user, info) => {
			if (err) {
				return next(err);
			}

			if (!user) {
				return res.redirect('/login');
			}

			req.logIn(user, err => {
				if (err) {
					return next(err);
				}

				const returnTo = req.session.returnTo;
				delete req.session.returnTo;
				res.redirect(returnTo || '/user');
			});
		})(req, res, next);
	});

	server.get('/_next*', (req, res) => {
		return handle(req, res);
	});

	server.get('/', (req, res) => {
		return app.render(req, res, '/', req.query);
	});

	return server;
};

export const createServerAsync = async app => {
	try {
		let envVars = process.env;

		if (envVars.IN_LAMBDA !== 'true') {
			const doc = yaml.safeLoad(
				fs.readFileSync(`./env/server/${envVars.API_ENV}.yml`, 'utf8')
			);

			envVars = Object.assign(envVars, doc);
		}

		envVars = await loadConfiguration(envVars);

		const server = createServer(envVars, app);
		return server;
	} catch (error) {
		console.log(error);
	}
};

if (process.env.IN_LAMBDA !== 'true') {
	console.log('starting');

	const app = next(nextConfig);

	app.prepare().then(() => {
		console.log('app prepared');
		createServerAsync(app)
			.then(server => {
				server.listen(process.env.TEST_SERVER_PORT || 8076, () =>
					console.log(
						`App started on port ${process.env.TEST_SERVER_PORT || 8076}`
					)
				);
			})
			.catch(error => {
				console.error(error);
			});
	});
}
