import { InterpretResponse } from "./api/interpret";
import { Map } from "common";

/**
 * Interpret represents the result from calling the interpret API.
 * 
 * @version 0.0.1
 * @author [Nikhil Kansal](https://github.com/nkansal96)
 */
export class Interpret {
	/**
	 * The detected intent of the user's query. Check the [dashboard](http://dashboard.auroraapi.com/dashboard/models)
	 * to see all of the different possible values this can be.
	 */
	public intent?: string;
	/**
	 * The detected entities from the user's queru. Check the [dashboard](http://dashboard.auroraapi.com/dashboard/models)
	 * to see all of the different possible values this can be.
	 */
	public entities?: Map<string>;

	/**
	 * Creates an Interpret object from the API response
	 * @param r the response from the API
	 */
	constructor(r: InterpretResponse) {
		this.intent = r.intent;
		this.entities = r.entities;
	}
}