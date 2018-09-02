import https from "https";
import http from "http";
import fs from "fs";
import { EventEmitter } from "events";
import * as enums from "../enums";

export default class Downloader extends EventEmitter {
  constructor({ url, destination }) {
    super();
    this._url = url;
    this._dest = destination;
  }

  exec() {
    const { _url, _dest } = this;
    const protocol = _url.includes("https") ? https : http;
    const request = protocol.get(_url, response => {
      let size = 0,
        downloadedBytes = 0;
      this.emit("pre-start");
      switch (response.statusCode) {
        case 200:
          size = response.headers["content-length"];
          break;
        default:
          request.abort();
          return this.emit("end", {
            code: enums.RESPONSE_CODES.FAILED,
            errType: enums.ERROR_TYPES.COULD_NOT_DOWNLOAD,
            errCode: response.statusCode
          });
      }
      const file = fs.createWriteStream(_dest);
      this.emit("start", parseInt(size, 10));
      response.on("data", chunk => {
        file.write(chunk);
        downloadedBytes += chunk.length;
        this.emit("received", downloadedBytes);
      });
      response.on("end", () => {
        file.end();
        this.emit("end", {
          code: enums.RESPONSE_CODES.OK
        });
      });
      request.on("error", err => {
        if (file) file.unlink(_dest);
        return this.emit("end", {
          code: enums.RESPONSE_CODES.FAILED,
          errType: enums.ERROR_TYPES.UNEXPECTED_ERROR,
          msg: response.statusCode
        });
      });
    });
  }
}
