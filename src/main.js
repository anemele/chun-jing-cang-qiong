// ==UserScript==
// @name         纯净苍穹
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.bilibili.com/video/*
// @match        https://zhuanlan.zhihu.com/p/*
// @match        https://www.zhihu.com/question/*
// @match        https://pan.baidu.com/share/init?surl=*
// @match        https://baike.baidu.com/pic/*
// @match        https://*.gushiwen.cn/*
// @match        https://www.sohu.com/*
// @match        https://www.163.com/dy/article/*
// @match        https://www.jianshu.com/p/*
// @icon         none
// @grant        none
// @require      https://cdn.staticfile.org/jquery/3.6.1/jquery.min.js
// ==/UserScript==

(function () {
    'use strict';

    [
        {
            // 哔哩哔哩倍速播放
            regex: new RegExp('bilibili\\.com/video/.*'),
            action: function () {
                let css = 'bwp-video'
                window.onload = function () {
                    if (document.querySelector(css) === null) { return }
                    let html = `
        <div id="playbackRateDiv" style="position:absolute;left:567px;top:678px;z-index:999">
        <p align="center">播放速率：<span>1</span></p>
        <input type="range" name="" title="playback rate" min="-4" max="4" step="0.5">
        </div>`;
                    $('body').append(html);
                    let range = document.querySelector('#playbackRateDiv>input')
                    range.onchange = function () {
                        (function (v) {
                            let rate = 2 ** v
                            document.querySelector(css).playbackRate = rate
                            document.querySelector('#playbackRateDiv>p>span').innerText = rate
                                .toFixed(4).replace(/\.?0+$/, '')
                        })(range.value)
                    }
                }
            }
        },
        {
            // 知乎专栏复制代码
            regex: new RegExp('zhuanlan\\.zhihu\\.com/p/.*'),
            action: function () {
                window.onload = function () {
                    (
                        function (id) {
                            document.querySelectorAll('div.highlight').forEach(
                                div => {
                                    let button = `<button id=btn${id}>copy</button>`
                                    div.innerHTML = button + div.innerHTML
                                    let btn = document.querySelector(`#btn${id++}`)
                                    btn.onclick = function () {
                                        navigator.clipboard.writeText(div.children[1].innerText)
                                        btn.innerText = 'Copied!'
                                        setTimeout(function () {
                                            btn.innerText = 'copy'
                                        }, 2000);
                                    }
                                }
                            )
                            return id;
                        }
                    )(0)
                }
            }
        },
        {
            // `知乎增强`补充，去除夹带广告
            regex: new RegExp('www\\.zhihu\\.com/question/.*'),
            action: function () { document.querySelectorAll('div.Pc-word').forEach(div => div.remove()) }
        },
        {
            // 百度网盘提取码页去广告
            regex: new RegExp('pan\\.baidu\\.com/share/init\\?surl=.*'),
            action: function () { document.querySelectorAll('iframe').forEach(ifrm => ifrm.remove()) }
        }, {
            // 百度百科词条图片去水印
            regex: new RegExp('baike\\.baidu\\.com/pic/.*'),
            action: function () {
                function replace() {
                    // this timeout is required, or fails.
                    setTimeout(function () {
                        // console.log(img.src)
                        img.src = img.src.match(/[0-9a-z:/.]+/)[0]
                        // console.log(img.src)
                    }, 500);
                }

                let img = document.querySelector('#imgPicture')
                replace()
                let mo = new MutationObserver(replace)
                let options = {
                    attributes: true,
                    attributeFilter: ['url']
                }
                mo.observe(img, options)
            }
        }, {
            // 古诗文网去广告
            regex: new RegExp('gushiwen.cn/.*'),
            action: function () {
                setTimeout(function () {
                    document.querySelectorAll('div.abcd').forEach(div => div.remove())
                    document.querySelector('#threeWeixin').remove()
                    document.querySelector('#threeWeixin2').remove()
                }, 3000)
            }
        }, {
            // 搜狐文章
            regex: new RegExp('www\\.sohu\\.com/.*'),
            action: function () {
                [
                    'body > *:not(.wrapper-box)',
                    'body > div > *:not(#article-container)',
                    '#article-container > div:not(.main)',
                    '#article-container > div > *:not(:first-child)'
                ]
                    .forEach(s => document.querySelectorAll(s).forEach(e => e.remove()));
            }
        }, {
            // 网易新闻
            regex: new RegExp('www\\.163\\.com/dy/article/.*'),
            action: function () {
                [
                    '#js_N_nav',
                    '#js_N_NTES_wrap',
                    'div.post_area.post_columnad_top',
                    'div.post_crumb',
                    'div.post_side',
                    '#content div.post_top',
                    '#content div.post_next',
                    'a.newsapp-qrcode',
                    'div.post_recommends.js-tab-mod',
                    'div.post_area.post_columnad_btm',
                    'div.N-nav-bottom',
                    '#post_comment_area',
                ].forEach(s => document.querySelector(s).remove());
            }
        }, {
            // 简书文章
            regex: new RegExp('www\\.jianshu\\.com/p/.*'),
            action: function () {
                let selectors = [
                    '#__next header',
                    '#__next footer',
                    '#__next div._3Pnjry',
                    'aside'
                ];
                selectors.forEach(s => {
                    let x = document.querySelector(s)
                    if (x !== null) x.remove()
                });

                let c = document.querySelectorAll('section.ouvJEz')
                for (let i = 1; i < c.length; i++) {
                    c[i].remove()
                }

                (new MutationObserver(function () {
                    [
                        'div.adad_container',
                        'body>div:not(#__next)'
                    ].forEach(s =>
                        document.querySelectorAll(s)
                            .forEach(x => x.remove())
                    );
                })).observe(document.body, { childList: true })
            }
        }
    ].some(function (site) {
        if (site.regex.test(window.location.href)) {
            console.log(site.regex);
            site.action();
        }
    });
})();