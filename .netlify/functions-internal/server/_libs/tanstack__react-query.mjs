import { f as QueryObserver, o as useBaseQuery, s as defaultThrowOnError } from "./@rainbow-me/rainbowkit+[...].mjs";
//#region node_modules/@tanstack/react-query/build/modern/useSuspenseQuery.js
function useSuspenseQuery(options, queryClient) {
	return useBaseQuery({
		...options,
		enabled: true,
		suspense: true,
		throwOnError: defaultThrowOnError,
		placeholderData: void 0
	}, QueryObserver, queryClient);
}
//#endregion
//#region node_modules/@tanstack/react-query/build/modern/queryOptions.js
function queryOptions(options) {
	return options;
}
//#endregion
export { useSuspenseQuery as n, queryOptions as t };
