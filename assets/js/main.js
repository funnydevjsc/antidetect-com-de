/* === ANTIDETECT ECOSYSTEM UNIFIED TRACKING (Meta Pixel 586278576865331 + GA4/GTM) === */
(function() {
    if (window.__ADC_TRACKING_LOADED) return;
    window.__ADC_TRACKING_LOADED = true;

    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
        window.gtag = function() { window.dataLayer.push(arguments); };
    }

    var PIXEL_ID = '586278576865331';
    var STD_FB_EVENTS = {
        PageView: 1, ViewContent: 1, Search: 1, AddToCart: 1, AddToWishlist: 1,
        InitiateCheckout: 1, AddPaymentInfo: 1, Purchase: 1, Lead: 1,
        CompleteRegistration: 1, Contact: 1, CustomizeProduct: 1, FindLocation: 1,
        Schedule: 1, StartTrial: 1, SubmitApplication: 1, Subscribe: 1
    };

    var hostname = (window.location.hostname || '').toLowerCase();
    var locale = (document.documentElement.lang || 'en').trim();

    function detectProductLine() {
        if (hostname.indexOf('browser.') === 0) return 'browser';
        if (hostname.indexOf('machine.') === 0) return 'machine';
        if (hostname.indexOf('android.') === 0) return 'android';
        if (hostname.indexOf('ios.') === 0) return 'ios';
        if (hostname.indexOf('vifox.') === 0) return 'vifox';
        if (hostname.indexOf('vitemail.') === 0) return 'vitemail';
        if (hostname.indexOf('download.') === 0) return 'download';
        if (hostname.indexOf('antidetect.computer') !== -1) return 'computer';
        if (hostname.indexOf('antidetect.tech') !== -1) return 'tech';
        return 'ecosystem';
    }
    var productLine = detectProductLine();

    function genEventId(prefix) {
        return (prefix || 'adc') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    }

    // 1. Attribution Persistence (UTM + fbclid + gclid + wbraid + gbraid)
    var ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'wbraid', 'gbraid', 'ref'];
    function readAttribution() {
        var data = {};
        try {
            var stored = sessionStorage.getItem('adc_attribution');
            if (stored) data = JSON.parse(stored) || {};
        } catch (e) {}
        try {
            var m = document.cookie.match(/(?:^|;\s*)_adc_attr=([^;]+)/);
            if (m && m[1]) {
                var parsed = JSON.parse(decodeURIComponent(m[1]));
                if (parsed && typeof parsed === 'object') {
                    Object.keys(parsed).forEach(function(k) {
                        if (!data[k]) data[k] = parsed[k];
                    });
                }
            }
        } catch (e) {}
        try {
            var sp = new URLSearchParams(window.location.search || '');
            var updated = false;
            ATTR_KEYS.forEach(function(k) {
                var val = sp.get(k);
                if (val) {
                    data[k] = val;
                    updated = true;
                }
            });
            if (updated) {
                sessionStorage.setItem('adc_attribution', JSON.stringify(data));
                var cookieStr = '_adc_attr=' + encodeURIComponent(JSON.stringify(data)) + '; path=/; max-age=2592000; SameSite=Lax';
                if (hostname.slice(-16) === 'antidetect.cloud') {
                    cookieStr += '; domain=.antidetect.cloud';
                }
                document.cookie = cookieStr;
            }
        } catch (e) {}
        return data;
    }
    var attribution = readAttribution();

    function decorateEcosystemUrl(anchor) {
        if (!anchor || !anchor.getAttribute) return;
        var rawHref = anchor.getAttribute('href') || '';
        if (!rawHref || rawHref.charAt(0) === '#' || rawHref.indexOf('mailto:') === 0 || rawHref.indexOf('tel:') === 0 || rawHref.indexOf('javascript:') === 0) return;
        try {
            var url = new URL(anchor.href, window.location.href);
            var h = (url.hostname || '').toLowerCase();
            var isEco = h === 'funnydev.vn' || h.slice(-16) === 'antidetect.cloud' || h.indexOf('antidetect.') === 0;
            if (!isEco || h === hostname) return;

            var changed = false;
            ATTR_KEYS.forEach(function(k) {
                if (attribution[k] && !url.searchParams.has(k)) {
                    url.searchParams.set(k, attribution[k]);
                    changed = true;
                }
            });
            if (!url.searchParams.has('src_domain')) {
                url.searchParams.set('src_domain', hostname);
                changed = true;
            }
            if (changed) {
                anchor.href = url.toString();
            }
        } catch (e) {}
    }

    // 2. Unified Dispatcher (Meta Pixel 586278576865331 + GTM dataLayer)
    function trackFunnel(fbEvent, gaEvent, params, skipDataLayer) {
        params = params || {};
        var eid = params.event_id || genEventId(gaEvent || fbEvent);

        if (fbEvent && typeof window.fbq === 'function') {
            var fbParams = {
                content_category: params.content_category || productLine,
                content_name: params.content_name || document.title,
                site_domain: hostname,
                site_locale: locale
            };
            if (params.content_type) fbParams.content_type = params.content_type;
            if (params.value !== undefined && params.value !== null && !isNaN(Number(params.value))) {
                fbParams.value = Number(params.value);
                fbParams.currency = params.currency || 'USD';
            }
            if (params.destination) fbParams.destination = params.destination;
            if (params.button_location) fbParams.location = params.button_location;

            try {
                if (STD_FB_EVENTS[fbEvent]) {
                    window.fbq('track', fbEvent, fbParams, { eventID: eid });
                } else {
                    window.fbq('trackCustom', fbEvent, fbParams, { eventID: eid });
                }
            } catch (e) {}
        }

        if (gaEvent && !skipDataLayer) {
            var dlPayload = {
                event: gaEvent,
                event_id: eid,
                product_line: productLine,
                site_domain: hostname,
                site_locale: locale
            };
            Object.keys(params).forEach(function(k) {
                if (params[k] !== undefined && params[k] !== null) {
                    dlPayload[k] = params[k];
                }
            });
            window.dataLayer.push(dlPayload);
        }
    }

    // Ensure direct Meta Pixel PageView event_id is also visible in dataLayer once
    if (window.__ADC_PV_EVENT_ID && !window.__ADC_PV_DL_PUSHED) {
        window.__ADC_PV_DL_PUSHED = true;
        window.dataLayer.push({
            event: 'adc_page_ready',
            event_id: window.__ADC_PV_EVENT_ID,
            product_line: productLine,
            site_domain: hostname,
            site_locale: locale
        });
    }

    // 3. Helper to extract plan title & numeric price inside pricing cards
    function extractPricingContext(el) {
        var card = el.closest('.package, .pricing-card, [data-plan], [data-id], .card, li, div');
        var planName = el.getAttribute('data-plan') || '';
        var priceVal;
        var currency = 'USD';

        if (card) {
            var heading = card.querySelector('h2, h3, h4, .plan-name, .package-title, .title');
            if (!planName && heading) planName = (heading.innerText || '').trim().slice(0, 60);
            var priceEl = card.querySelector('.price-value, .uk-plan-price, [id^="price"], .price');
            var priceText = priceEl ? (priceEl.innerText || '') : (card.innerText || '');
            if (priceText.indexOf('£') !== -1) currency = 'GBP';
            else if (priceText.indexOf('€') !== -1) currency = 'EUR';
            var pm = priceText.match(/(?:[$£€]\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*[$£€])/);
            if (pm) {
                var raw = (pm[1] || pm[2] || '').replace(',', '.');
                var num = parseFloat(raw);
                if (!isNaN(num) && num > 0 && num < 50000) priceVal = num;
            }
        }
        return { planName: planName, value: priceVal, currency: currency };
    }

    function getLocationLabel(el) {
        if (el.closest('nav')) return 'navbar';
        if (el.closest('header')) return 'hero';
        if (el.closest('#pricing, .pricing, .pricing-modern')) return 'pricing';
        if (el.closest('#advertising')) return 'advertising';
        if (el.closest('footer')) return 'footer';
        var sec = el.closest('section[id]');
        return sec ? sec.id : 'body';
    }

    // 4. Decorate ecosystem links before navigation
    ['pointerdown', 'auxclick', 'click'].forEach(function(evtType) {
        document.addEventListener(evtType, function(e) {
            var a = e.target && e.target.closest ? e.target.closest('a') : null;
            if (a) decorateEcosystemUrl(a);
        }, { capture: true, passive: true });
    });

    // 5. Click Funnel Tracking (Checkout, Lead, Contact, Download, Video, FAQ, Ecosystem, Social)
    document.addEventListener('click', function(e) {
        var target = e.target && e.target.closest ? e.target.closest('a, button') : null;
        if (!target) return;

        var href = target.getAttribute('href') || '';
        var fullHref = target.href || href;
        var text = (target.innerText || target.getAttribute('aria-label') || target.value || '').replace(/\s+/g, ' ').trim();
        var lower = text.toLowerCase();
        var loc = getLocationLabel(target);
        var hasInlinePush = target.hasAttribute('onclick') && (target.getAttribute('onclick') || '').indexOf('dataLayer.push') !== -1;

        // A. Pricing cycle / currency / simulator toggles -> PricingInteraction
        if (target.matches('.tab-button, .pricing-cycle-btn, .uk-curr-btn, [data-cycle], [data-currency], .tech-sim-tab, #modeBtnCloaked, #modeBtnStock')) {
            trackFunnel('PricingInteraction', 'pricing_click', {
                content_name: text || target.getAttribute('data-cycle') || target.getAttribute('data-currency') || target.getAttribute('data-profile') || 'toggle',
                content_category: productLine,
                button_location: loc
            }, hasInlinePush);
            return;
        }

        // B. Contact (Email, Telegram, Discord, WhatsApp) -> Standard Contact
        if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 ||
            fullHref.indexOf('t.me/') !== -1 || fullHref.indexOf('discord.gg/') !== -1 || fullHref.indexOf('whatsapp.com/') !== -1) {
            var method = href.indexOf('mailto:') === 0 ? 'email' : (fullHref.indexOf('t.me/') !== -1 ? 'telegram' : (fullHref.indexOf('discord.gg/') !== -1 ? 'discord' : 'whatsapp'));
            trackFunnel('Contact', 'contact', {
                content_name: method + (text ? ': ' + text.slice(0, 40) : ''),
                content_category: productLine,
                destination: fullHref,
                button_location: loc
            }, hasInlinePush);
            if (!hasInlinePush) {
                window.dataLayer.push({ event: 'contact_click', method: method, destination: fullHref, product_line: productLine });
            }
            return;
        }

        // C. Video / Demo clicks -> VideoDemoClick
        if (fullHref.indexOf('youtube.com/watch') !== -1 || fullHref.indexOf('youtu.be/') !== -1) {
            trackFunnel('VideoDemoClick', 'video_click', {
                content_name: text || 'demo_video',
                content_category: productLine,
                destination: fullHref,
                button_location: loc
            }, hasInlinePush);
            return;
        }

        // D. Pricing Purchase / Portal inside Pricing -> InitiateCheckout
        var inPricing = !!target.closest('#pricing, .pricing, .pricing-modern, .package, .pricing-card');
        var isBuyText = /(buy now|buy plan|mua ngay|chọn gói|đăng ký gói|purchase|checkout|subscribe|купить|оформить|acheter|kaufen|acquista|koop|hoko|get plan|order now)/.test(lower);
        var isPortalOrPay = fullHref.indexOf('portal.antidetect.cloud') !== -1 || fullHref.indexOf('vitelicense') !== -1 || fullHref.indexOf('vitepay') !== -1;

        if ((inPricing && (isPortalOrPay || isBuyText || target.hasAttribute('data-plan'))) || (isBuyText && fullHref.indexOf('#') !== 0)) {
            var pCtx = extractPricingContext(target);
            trackFunnel('InitiateCheckout', 'begin_checkout', {
                content_name: pCtx.planName || text || 'plan_checkout',
                content_category: productLine,
                content_type: 'product',
                value: pCtx.value,
                currency: pCtx.currency,
                destination: fullHref,
                button_location: loc
            }, hasInlinePush);
            return;
        }

        // E. Downloads & App Stores -> Lead
        var isDownload = target.id === 'downloadBtn' ||
            fullHref.indexOf('download.antidetect.cloud') !== -1 ||
            fullHref.indexOf('apps.apple.com') !== -1 ||
            fullHref.indexOf('play.google.com') !== -1 ||
            fullHref.indexOf('drive.google.com') !== -1 ||
            fullHref.indexOf('mega.nz') !== -1 ||
            fullHref.indexOf('mediafire.com') !== -1 ||
            fullHref.indexOf('dropbox.com') !== -1 ||
            fullHref.indexOf('1drv.ms') !== -1 ||
            fullHref.indexOf('terabox.com') !== -1 ||
            /\.(exe|dmg|apk|zip|msi)(\?|$)/i.test(fullHref);

        if (isDownload) {
            trackFunnel('Lead', 'generate_lead', {
                content_name: 'download_' + (text || productLine).slice(0, 60),
                content_category: productLine,
                destination: fullHref,
                button_location: loc
            }, hasInlinePush);
            if (!hasInlinePush) {
                window.dataLayer.push({ event: 'download_click', button_text: text, destination: fullHref, button_location: loc, product_line: productLine });
            }
            return;
        }

        // F. Portal / Signup / High-Intent CTAs -> Lead
        var isCtaText = /(get started|try free|try now|start using|trial|sign up|register|bắt đầu|dùng thử|truy cập portal|commencer|jetzt starten|inizia|begin nu|начать|вход|tīmata)/.test(lower);
        if (isPortalOrPay || (isCtaText && target.tagName === 'A')) {
            trackFunnel('Lead', 'generate_lead', {
                content_name: text || 'portal_signup',
                content_category: productLine,
                destination: fullHref,
                button_location: loc
            }, hasInlinePush);
            if (!hasInlinePush) {
                window.dataLayer.push({ event: 'signup_click', button_text: text, destination: fullHref, button_location: loc, product_line: productLine });
            }
            return;
        }

        // G. Ecosystem cross-navigation (between sibling product/regional sites)
        try {
            if (fullHref.indexOf('http') === 0) {
                var destUrl = new URL(fullHref);
                var dh = (destUrl.hostname || '').toLowerCase();
                if (dh && dh !== hostname && (dh.slice(-16) === 'antidetect.cloud' || dh.indexOf('antidetect.') === 0)) {
                    trackFunnel('EcosystemCrossClick', 'ecosystem_click', {
                        content_name: text || dh,
                        content_category: productLine,
                        destination: fullHref,
                        button_location: loc
                    }, hasInlinePush);
                    return;
                }
            }
        } catch (err) {}

        // H. FAQ Interaction
        if (target.closest('#faq, .faq, .faq-item, .uk-faq-item') || target.classList.contains('faq-button') || target.classList.contains('faq-question') || target.classList.contains('uk-faq-question') || (target.tagName === 'BUTTON' && text.indexOf('?') !== -1)) {
            if (text.length > 3) {
                trackFunnel('FAQInteraction', 'faq_expand', {
                    content_name: text.split('\n')[0].trim().slice(0, 100),
                    content_category: productLine,
                    button_location: 'faq'
                }, hasInlinePush);
            }
            return;
        }

        // I. Social & Outbound
        if (fullHref.indexOf('http') === 0) {
            try {
                var u = new URL(fullHref);
                if (u.hostname && u.hostname.toLowerCase() !== hostname) {
                    if (/youtube\.com|facebook\.com|instagram\.com|twitter\.com|x\.com|vk\.com/.test(u.hostname)) {
                        trackFunnel('SocialClick', 'social_click', {
                            content_name: u.hostname,
                            destination: fullHref,
                            button_location: loc
                        }, hasInlinePush);
                    } else if (!hasInlinePush) {
                        window.dataLayer.push({ event: 'outbound_link', destination: fullHref, content_name: text, product_line: productLine });
                    }
                }
            } catch (err) {}
        }
    }, { passive: true });

    // 6. ViewContent on Key Product / Pricing / Download Sections
    function initSectionObservers() {
        var viewedSections = {};
        var sectionSelectors = ['#products', '#product', '#pricing', '#download', '#features', '#feature'];
        var targets = [];
        sectionSelectors.forEach(function(sel) {
            var el = document.querySelector(sel);
            if (el && targets.indexOf(el) === -1) targets.push(el);
        });
        if (!targets.length || typeof IntersectionObserver !== 'function') return;

        var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var sid = entry.target.id || 'section';
                    if (!viewedSections[sid]) {
                        viewedSections[sid] = true;
                        obs.unobserve(entry.target);
                        if (sid === 'pricing' || sid === 'products' || sid === 'product' || sid === 'download') {
                            trackFunnel('ViewContent', 'view_item', {
                                content_name: productLine + '_' + sid,
                                content_category: productLine,
                                content_type: 'product',
                                button_location: sid
                            }, false);
                        }
                    }
                }
            });
        }, { threshold: 0.25 });

        targets.forEach(function(el) { obs.observe(el); });
    }

    // 7. Engaged Visitor + Scroll Depth + Time on Page
    var engagedSent = false;
    function markEngaged(reason) {
        if (engagedSent) return;
        engagedSent = true;
        trackFunnel('EngagedVisitor', 'engaged_visitor', {
            content_name: reason,
            content_category: productLine
        }, false);
    }

    var scrollMarks = [25, 50, 75, 90];
    var sentScroll = {};
    window.addEventListener('scroll', function() {
        var docH = document.documentElement.scrollHeight || 1;
        var pct = ((window.scrollY + window.innerHeight) / docH) * 100;
        scrollMarks.forEach(function(m) {
            if (pct >= m && !sentScroll[m]) {
                sentScroll[m] = true;
                window.dataLayer.push({ event: 'scroll_depth', percent: m, depth_percent: m, product_line: productLine, site_locale: locale });
                if (m >= 50) markEngaged('scroll_' + m);
            }
        });
    }, { passive: true });

    [30, 60, 180].forEach(function(sec) {
        setTimeout(function() {
            window.dataLayer.push({ event: 'time_on_page', seconds: sec, product_line: productLine, site_locale: locale });
            if (sec >= 30) markEngaged('dwell_' + sec + 's');
        }, sec * 1000);
    });

    // 8. Ensure footer year elements are populated
    function syncYears() {
        var yr = String(new Date().getFullYear());
        document.querySelectorAll('#year, #year_now, #copyrightYear, .year-current').forEach(function(el) {
            el.textContent = yr;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initSectionObservers();
            syncYears();
        });
    } else {
        initSectionObservers();
        syncYears();
    }
})();
/* === END ANTIDETECT ECOSYSTEM UNIFIED TRACKING === */
