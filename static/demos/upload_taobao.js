// ==UserScript==
// @name              定期上报淘宝cookie
// @namespace         https://github.com/inu1255/soulsign-chrome
// @version           1.0.3
// @author            inu1255
// @loginURL          http://pub.alimama.com
// @expire            900e3
// @grant             cookie
// @domain            pub.alimama.com
// @domain            login.taobao.com
// @domain            www.taobao.com
// @domain            savemoney.inu1255.cn
// @domain            localhost
// @param             name 账号
// @param             pwd 密码
// ==/UserScript==

async function getNickname() {
	var {data} = await axios.get("https://pub.alimama.com/common/getUnionPubContextInfo.json", {
		headers: {},
	});
	if (data.ok) return data.data.mmNick;
}

exports.run = async function () {
	return await getNickname();
};

exports.check = async function (param) {
	if (await getNickname()) {
		let data = await checkCookie();
		if (data.code == 0) return true;
	}
	await open("https://pub.alimama.com/", false, async (fb) => {
		await fb.sleep(1e3);
		await fb.getFrame("https://login.taobao.com/member/login.jhtml").then(async (fb) => {
			await fb.value("#fm-login-id", param.name);
			await fb.value("#fm-login-password", param.pwd);
			await fb.click(".password-login");
		});
		await fb.waitLoaded();
	});
	if (await getNickname()) {
		let data = await checkCookie();
		if (data.code == 0) return true;
	}
	return false;
};

async function checkCookie() {
	let _m_h5_tk = (await getCookie("https://www.taobao.com", "_m_h5_tk")) || "";
	let _m_h5_tk_enc = (await getCookie("https://www.taobao.com", "_m_h5_tk_enc")) || "";
	let cookie2 = (await getCookie("https://www.taobao.com", "cookie2")) || "";
	let _tb_token_ = (await getCookie("https://www.taobao.com", "_tb_token_")) || "";
	let isg = (await getCookie("https://www.taobao.com", "isg")) || "";
	let cookie = `_m_h5_tk=${_m_h5_tk};_m_h5_tk_enc=${_m_h5_tk_enc};cookie2=${cookie2};_tb_token_=${_tb_token_};isg=${isg}`;
	axios.post("http://localhost:3004/api/pintuan/setcookie", {
		user_type: 1,
		cookie,
	});
	var {data} = await axios.post("https://savemoney.inu1255.cn/api/pintuan/setcookie", {
		user_type: 1,
		cookie,
	});
	return data;
}
