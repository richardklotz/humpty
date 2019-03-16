import {DateTime} from 'luxon';
import {
	API_CALL_STARTED,
	API_CALL_FINISHED,
	API_CALL_FAILED,
	API_CALL_RESET,
} from '../constants/action-types';

export const apiCallStarted = (
	request,
	stateKey,
	timestamp = DateTime.local()
) => ({
	type: API_CALL_STARTED,
	request,
	stateKey,
	timestamp,
});

export const apiCallFinished = (
	response,
	stateKey,
	originalAction,
	timestamp = DateTime.local()
) => ({
	type: API_CALL_FINISHED,
	response,
	stateKey,
	originalAction,
	timestamp,
});

export const apiCallFailed = (
	response,
	stateKey,
	originalAction,
	timestamp = DateTime.local()
) => ({
	type: API_CALL_FAILED,
	response,
	stateKey,
	originalAction,
	timestamp,
});

export const apiCallReset = stateKey => ({
	type: API_CALL_RESET,
	stateKey,
});
