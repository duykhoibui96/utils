import keyMirror from "keymirror";

export const ERROR_TYPES = keyMirror({
  COULD_NOT_DOWNLOAD: null,
  FILE_ERROR: null,
  UNEXPECTED_ERROR: null
});

export const RESPONSE_CODES = keyMirror({
  OK: null,
  FAILED: null
});
