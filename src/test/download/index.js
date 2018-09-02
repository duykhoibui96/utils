import { expect } from "chai";
import fs from "fs";
import Downloader from "../../services/downloader";
import files from "./files";
import * as enums from "../../enums";

describe("Downloading 1 file", () => {
  const file = files[0];
  let total = 0;

  before(() => {
    fs.unlinkSync(file.destination);
  });

  it("should finish downloading", done => {
    new Downloader(file)
      .on("pre-start", () => {
        console.log(`Fetching resource from ${file.url}`);
      })
      .on("start", size => {
        console.log(`Start downloading with file size ${size} bytes`);
        total = size;
      })
      .on("received", bytes => {
        console.log(`Received ${bytes} bytes / ${total} bytes`);
      })
      .on("end", res => {
        if (res.code === enums.RESPONSE_CODES.OK) {
          console.log(`File saved at ${file.destination}`);
        } else {
          switch (res.errType) {
            case enums.ERROR_TYPES.COULD_NOT_DOWNLOAD:
              console.log("Fetching resource failed");
              break;
            default:
              console.log("Unexpected error");
              console.log(res.msg);
          }
        }
        expect(res.code).to.equal(enums.RESPONSE_CODES.OK);
        done();
      })
      .exec();
  });
  
  it("file should have full size", () => {
    const { size } = fs.statSync(file.destination);
    expect(size).to.equal(total);
  });
});
