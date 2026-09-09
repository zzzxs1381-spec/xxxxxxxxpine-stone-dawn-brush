import { o as __toESM } from "../_runtime.mjs";
import { V as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as getAccount } from "./server-BdIVESeH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-account-XL7xnknw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useAccount() {
	const [data, setData] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	const reload = (0, import_react.useCallback)(async () => {
		try {
			const next = await getAccount();
			setData(next);
			setErr(null);
			return next;
		} catch {
			setErr("Не удалось загрузить кабинет");
			return null;
		}
	}, []);
	(0, import_react.useEffect)(() => {
		reload();
	}, [reload]);
	return {
		data,
		err,
		reload
	};
}
//#endregion
export { useAccount as t };
