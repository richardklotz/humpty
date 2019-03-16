import {diff} from 'deep-object-diff';
import logger from '../utils/logger';

const reduxLogger = store => next => action => {
	logger.debug(action.type);
	const oldState = store.getState();

	logger.debug(`dispatching`, action);
	const result = next(action);
	const newState = store.getState();

	logger.debug(
		'state diff',
		diff(oldState.appState.toJS(), newState.appState.toJS())
	);

	return result;
};

export default reduxLogger;
