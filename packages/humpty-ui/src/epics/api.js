import {fromJS} from 'immutable';
import {of, timer, throwError} from 'rxjs';
import {ajax} from 'rxjs/ajax';
import {mergeMap, map, catchError, retryWhen, finalize} from 'rxjs/operators';
import {ofType} from 'redux-observable';
import * as types from '../constants/action-types';
import * as actions from '../actions/epic';
import logger from '../utils/logger';
import apiConfig from './api-config';

export const indirect = {
	call: (fn, ...args) => fn(...args),
};

export const retryStrategy = ({
	maxRetryAttempts = 3,
	scalingDuration = 1000,
	excludedStatusCodes = [],
	stateKey,
	action,
}) => attempts => {
	return attempts.pipe(
		mergeMap((error, i) => {
			const retryAttempt = i + 1;
			// if maximum number of retries have been met
			// or response is a status code we don't wish to retry, throw error
			if (
				retryAttempt > maxRetryAttempts ||
				excludedStatusCodes.find(e => e === error.status)
			) {
				return throwError(error);
			}

			logger.debug(
				`StateKey ${stateKey} Attempt ${retryAttempt}: retrying in ${retryAttempt *
					scalingDuration}ms`
			);
			// retry after 1s, 2s, etc...
			return timer(retryAttempt * scalingDuration);
		}),
		finalize(error => logger.debug(`stateKey ${stateKey} finished`))
	);
};

export const callApiInternal = (request, stateKey) => {
	const config = apiConfig[stateKey];

	logger.debug(`api config`, config);

	const headers = config.headers || {};

	let {url} = config;

	if (config.buildUrl) {
		url = config.buildUrl(request);
	}

	if (config.method === 'post') {
		headers['Content-Type'] = 'application/json';

		if (request.delete) {
			request = request.delete('validation');
		}

		logger.debug(`POST to ${url}`, request);
		return ajax.post(url, request, headers);
	}

	logger.debug(`GET  ${url}`);

	return ajax.getJSON(url, headers);
};

export const apiEpic = (action$, store, callApi = callApiInternal) => {
	return action$.pipe(
		ofType(types.API_CALL_STARTED),
		mergeMap(action =>
			callApi(action.request, action.stateKey).pipe(
				map(payload => {
					if (payload.response) {
						return actions.apiCallFinished(
							fromJS(payload.response),
							action.stateKey,
							action
						);
					}

					return actions.apiCallFinished(
						fromJS(payload),
						action.stateKey,
						action
					);
				}),
				retryWhen(
					retryStrategy({
						maxRetryAttempts: apiConfig[action.stateKey]
							? apiConfig[action.stateKey].retries || 0
							: 0,
						excludedStatusCodes: [404, 401, 400],
						stateKey: action.stateKey,
						action,
					})
				),
				catchError(error => {
					logger.error('error in api epic', error);

					if (error.response) {
						return of(
							actions.apiCallFailed(
								fromJS(error.response),
								action.stateKey,
								action
							)
						);
					}

					return of(
						actions.apiCallFailed(fromJS(error), action.stateKey, action)
					);
				})
			)
		)
	);
};
