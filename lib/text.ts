import getInterpret from "./api/interpret";
import getTTS from "./api/tts";
import config from "./config";

import { Interpret } from "./interpret";
import { Speech } from "./speech";

/**
 * Text is a class representing some text. It's a high level object that
 * allows you to perform API operations on text, such as converting to
 * speech or interpreting the text.
 *
 * @version 0.0.1
 * @author [Nikhil Kansal](https://github.com/nkansal96)
 */
export class Text {
  /**
   * The actual text encapsulated by this class
   */
  public text: string;

  /**
   * Creates a Text object from the given text
   *
   * @param text the text to encapsulate
   */
  constructor(text: string) {
    this.text = text;
  }

  /**
   * Calls the Aurora Interpret API on the text encapsulated by this
   * object. It returns the interpretted results.
   */
  public async interpret() {
    const res = await getInterpret(config, this.text);
    return new Interpret(res);
  }

  /**
   * Calls the Aurora TTS API on the text encapsulated by this object.
   * It returns a Speech object with the audio returned by the API call.
   */
  public async speech() {
    const res = await getTTS(config, this.text);
    return new Speech(res);
  }
}
