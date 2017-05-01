import * as actions from './actions';

export default class Actions {
    constructor(apiClient) {
        this.apiClient = apiClient;
        console.log(actions);
        // actions.forEach(console.log);
    }
}