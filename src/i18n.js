// ===== LANGUAGE =====
// Two languages: Vietnamese (default) and English. Texts are written as T('tiếng Việt','English') and picked once at load time,
// so changing language reloads the page; a running game is saved first and resumed automatically.
const LANG=(()=>{try{return localStorage.getItem('btd_lang')==='en'?'en':'vi'}catch(e){return'vi'}})();
const EN=LANG==='en';
function T(vi,en){return EN?en:vi}
const NUM_LOCALE=EN?'en-US':'vi-VN';
document.documentElement.lang=LANG;
document.title=T('Một ngày làm shipper','Shipper Simulator');
function setLang(l){
  if(l===LANG)return;
  if(typeof DLV!=='undefined'&&DLV){toast(T('ĐỢI GIAO XONG ĐƠN RỒI ĐỔI NGÔN NGỮ','FINISH THE CURRENT ORDER FIRST'),'warn');return}
  try{
    if(g&&g.phase==='game'){persistNow();sessionStorage.setItem('btd_resume','1')}
    localStorage.setItem('btd_lang',l);
  }catch(e){}
  location.reload();
}
function langBtns(){
  return`<span class="lang-sw" role="group" aria-label="Language"><button class="btn sm ${EN?'b-dim':'b-gr'}" onclick="setLang('vi')" aria-pressed="${!EN}">VI</button><button class="btn sm ${EN?'b-gr':'b-dim'}" onclick="setLang('en')" aria-pressed="${EN}">EN</button></span>`;
}
