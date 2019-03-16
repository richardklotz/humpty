import {combineEpics} from 'redux-observable';
import {apiEpic} from './api';

const epics = [apiEpic];
export default combineEpics(...epics);
