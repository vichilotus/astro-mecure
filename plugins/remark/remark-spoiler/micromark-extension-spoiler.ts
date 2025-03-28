import { markdownLineEnding } from "micromark-util-character";
import { factorySpace } from "micromark-factory-space";

import { codes, types, constants } from "micromark-util-symbol";

import type {
  Construct,
  Tokenizer,
  State,
  Extension as MicromarkExtension,
} from "micromark-util-types";

declare module "micromark-util-types" {
  interface TokenTypeMap {
    spoiler: "spoiler";
    spoilerMarker: "spoilerMarker";
  }
}

const tokenizeSpoiler: Tokenizer = (effects, ok, nok) => {
  const start: State = (code) => {
    effects.enter("spoiler");
    return effects.attempt(
      marker,
      factorySpace(effects, contentStart, types.whitespace),
      nok
    );
  };
  const contentStart: State = (code) => {
    effects.enter(types.chunkText, {
      contentType: constants.contentTypeText,
    });
    return content;
  };
  const content: State = (code) =>
    effects.check(
      marker,
      factorySpace(effects, contentAfter, types.whitespace),
      comsumeData
    );
  const comsumeData: State = (code) => {
    if (markdownLineEnding(code) || code === codes.eof) {
      return nok;
    }
    effects.consume(code);
    return content;
  };
  const contentAfter: State = (code) => {
    effects.exit(types.chunkText);
    return effects.attempt(marker, after, nok);
  };
  const after: State = (code) => {
    effects.exit("spoiler");
    return ok;
  };
  return start;
};

const tokenizeMarker: Tokenizer = function (effects, ok, nok) {
  let markerSize = 0;
  if (this.previous === codes.exclamationMark) {
    return nok;
  }
  const start: State = (code) => {
    effects.enter("spoilerMarker");
    return marker;
  };
  const marker: State = (code) => {
    if (code === codes.exclamationMark) {
      effects.consume(code);
      markerSize++;
      return marker;
    }
    if (markerSize === 2) {
      effects.exit("spoilerMarker");
      markerSize = 0;
      return ok;
    }
    return nok;
  };
  return factorySpace(effects, start, types.whitespace);
};

const marker: Construct = {
  tokenize: tokenizeMarker,
  partial: true,
};

const spoiler: Construct = {
  name: "spoiler",
  tokenize: tokenizeSpoiler,
};

export const syntax = (): MicromarkExtension => {
  return {
    text: {
      [codes.exclamationMark]: spoiler,
    },
  };
};
