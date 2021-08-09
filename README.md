A small CLI tool to see if your project's browser support, support a specific feature.

> A mapping of your `.browserlistrc` and `caniuse.com` data

https://user-images.githubusercontent.com/952992/128766331-32cc038c-132b-40d7-8d53-461526a5d7c0.mp4

## Usage:

Install globally

```
yarn global add @fforres/can-i-support
```

Run this on the folder where a browserlist config exists.

```
caniuse
```


### TODO:

- Use NCC better (Remove all the packages that are added in package.json)
- Pass an npmrc config file location (caniuse --config ./some/path/to/.browserlistrc)
- Pass an npmrc config as text (caniuse --browserlist last 3 versions, > 1%, not  dead, not IE 11, not IE_Mob 11, not op_mini all)
- Support for passing feature trhough cli (caniuse webworkers || npx  supports )
- Support multiple features (caniuse webworkers serviceworkers)
