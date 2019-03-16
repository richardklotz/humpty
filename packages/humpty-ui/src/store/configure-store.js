import {createStore, applyMiddleware, combineReducers} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension/logOnlyInProduction';
import {Map, fromJS} from 'immutable';
import {createEpicMiddleware} from 'redux-observable';
import rootReducer from '../reducers';
import rootEpic from '../epics';
import logger from './redux-logger';

const epicMiddleware = createEpicMiddleware();

const makeConfiguredStore = (reducer, initialState) =>
	createStore(
		reducer,
		initialState,
		composeWithDevTools(applyMiddleware(logger, epicMiddleware))
	);

export default initialState => {
	if (initialState && !Map.isMap(initialState.appState)) {
		initialState.appState = fromJS(initialState.appState);
	}

	const store = makeConfiguredStore(combineReducers(rootReducer), initialState);

	epicMiddleware.run(rootEpic);

	return store;
};
