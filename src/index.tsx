import d from "debug";
import { exec } from "child_process";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const updateDb = require("browserslist/update-db");
import React, { useState, useEffect } from "react";
import { Box, render, Text } from "ink";
import { QuickSearchInput, Item } from "@fforres/ink-quicksearch-input";
import Spinner from "ink-spinner";

const log = d("is_supported");

const browserNameMapping: Record<string, string> = {
  and_chr: "Chrome for Android",
  ChromeAndroid: "Chrome for Android",
  and_ff: "Firefox for Android",
  FirefoxAndroid: "Firefox for Android",
  and_qq: "QQ Browser for Android",
  QQAndroid: "QQ Browser for Android",
  and_uc: "UC Browser for Android",
  UCAndroid: "UC Browser for Android",
  iOS: "iOS Safari",
  ios_saf: "iOS Safari",
  android: "Android",
  baidu: "Baidu",
  chrome: "Chrome",
  edge: "Edge",
  firefox: "Firefox",
  kaios: "KaiOS Browser",
  op_mob: "Opera Mobile",
  OperaMobile: "Opera Mobile",
  opera: "Opera",
  safari: "Safari",
  samsung: "Samsung",
};

// Ensures browserslist DB is up to date.

const execPromise = () =>
  new Promise((resolve, reject) => {
    exec("npm run update", (err, stdout, stderr) => {
      if (stderr) {
        log(stderr);
      }
      if (stdout) {
        log(stderr);
      }
      if (err) {
        reject(stderr);
      } else {
        resolve(true);
      }
    });
  });

class Result {
  GlobalSupport: string | number;
  YourSupport: number;
  Supported: string;
  constructor(
    GlobalSupport: string | number,
    YourSupport: number,
    Supported: string,
  ) {
    this.GlobalSupport = GlobalSupport;
    this.YourSupport = YourSupport;
    this.Supported = Supported;
  }
}

const testApi = async (api: string) => {
  let pass = true;
  // Create a support matrix object
  const list: Record<string, number> = {};
  // For each browserslist key (UA type) set the lowest version that needs to be supported
  const browserslist = await import("browserslist");
  browserslist.default().forEach((browser) => {
    const [browserName, version] = browser.split(" ");
    const currentBrowserVersion = list[browserName];
    const versionAsNumber = parseFloat(version);
    if (
      typeof list[browserName] === "undefined" ||
      currentBrowserVersion > versionAsNumber
    ) {
      list[browserName] = versionAsNumber;
    }
  });
  // Get caniuse support details for passed in API
  const caniuse = await import("caniuse-api");
  const supportList = caniuse.getSupport(api);
  // Create an object to match the structure of the support matrix
  const supported: Record<string, number | undefined> = {};
  // Find minimum versions for each UA that support the passed in API
  Object.keys(supportList).forEach((su) => {
    // May need to check `supportList[ua]` and `supportList[ua]["y"] exist, not sure
    supported[su] = supportList[su]["y"]; // "y" is full support
  });

  // We save everyting on a cool object and use Result to be able to use console.table.
  const results: Record<string, Result> = {};
  Object.keys(supported).forEach((ua) => {
    const supportedElement = supported[ua];
    const passes = Boolean(
      supportedElement && supportedElement && supportedElement <= list[ua],
    );
    results[browserNameMapping[ua] || ua] = new Result(
      typeof supportedElement === "undefined"
        ? "Not Supported"
        : supportedElement,
      list[ua],
      passes ? "✅" : "❌",
    );
    if (!passes) {
      pass = false;
    }
  });

  console.table(results);
  if (pass) {
    console.log(`😁 Your browserlist config supports: ${api}`);
  } else {
    console.log(`😢 Your browserlist does not fully supports: ${api}
You might want to look into a Ponyfill for it https://ponyfill.com`);
  }
  console.log(`

========
`);
};

const Counter = () => {
  const [state, setState] = useState<"none" | "loading" | "ready">("none");
  const [items, setItems] = useState<Item[]>([]);
  const [selectedApi, setSelectedApi] = useState<string | null>(null);

  useEffect(() => {
    const download = async () => {
      setState("loading");
      updateDb(function (str: string) {
        log("Browserlist: %s", str);
      });
      await execPromise();
      const { features } = await import("caniuse-api");
      const featuresItems = features.map((feature) => ({
        value: feature,
        label: feature,
      }));
      setItems(featuresItems);
      setState("ready");
    };
    download();
  }, []);

  useEffect(() => {
    if (!selectedApi) {
      return;
    }
    testApi(selectedApi);
  }, [selectedApi]);

  if (state === "none") {
    return <Box></Box>;
  }
  if (state === "loading") {
    return <Spinner type="dots" />;
  }
  if (state === "ready") {
    return (
      <>
        <QuickSearchInput
          items={items}
          limit={10}
          onSelect={(item) => setSelectedApi(item.label)}
        />
        {selectedApi && (
          <Box paddingY={2}>
            <Text>{selectedApi}</Text>
          </Box>
        )}
      </>
    );
  }
  // This should return an error
  throw new Error("Non permitted state");
};

render(<Counter />);
