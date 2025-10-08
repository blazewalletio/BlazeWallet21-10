# 🔥 BLAZE Wallet Deployment Guide

## 🌐 Domain Setup

### Current Structure:
- **Wallet App**: `my.blazewallet.io` (Vercel Project: arcwallet)
- **Marketing Site**: `www.blazewallet.io` & `blazewallet.io` (Nieuw Vercel Project)

---

## 📝 Step-by-Step: Custom Domain Setup

### 1. Add my.blazewallet.io to Current Wallet Project

#### Option A: Via Vercel Dashboard (Makkelijkst)
1. Ga naar: https://vercel.com/rick-schlimbacks-projects/arcwallet
2. Klik op **Settings** → **Domains**
3. Voeg toe: `my.blazewallet.io`
4. Volg de instructies om DNS te configureren

#### Option B: Via CLI
```bash
cd "/Users/rickschlimback/Desktop/Crypto wallet app"
npx vercel alias my.blazewallet.io
```

---

### 2. DNS Configuration (Bij je Domain Provider)

Ga naar je domain provider (bijv. Namecheap, GoDaddy, Cloudflare) en voeg deze records toe:

#### Voor my.blazewallet.io (Wallet):
```
Type: CNAME
Name: my
Value: cname.vercel-dns.com
TTL: Auto
```

#### Voor www.blazewallet.io (Marketing Site):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

#### Voor blazewallet.io (Root Domain):
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
```

**OF als je provider CNAME Flattening ondersteunt:**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: Auto
```

---

### 3. Verification

Na het toevoegen van DNS records:
- **Propagation Time**: 5-60 minuten (kan tot 24 uur duren)
- **Check Status**: `nslookup my.blazewallet.io`
- **Vercel Status**: Vercel dashboard toont "Valid" als het werkt

---

## 🎨 Marketing Website Project (Nieuw)

### Create New Next.js Project for Marketing:
```bash
cd ~/Desktop
npx create-next-app@latest blaze-marketing --typescript --tailwind --app --eslint --no-src-dir
cd blaze-marketing
npm run dev
```

### Deploy Marketing Site:
```bash
cd ~/Desktop/blaze-marketing
npx vercel --prod
# Voeg domains toe: www.blazewallet.io & blazewallet.io
```

---

## 🔐 SSL Certificates

Vercel handelt automatisch SSL certificates af via Let's Encrypt:
- ✅ Gratis
- ✅ Auto-renewal
- ✅ Werkt binnen enkele minuten na domain verificatie

---

## 🚨 Common Issues & Fixes

### Issue: "Invalid Configuration"
**Fix**: Controleer of DNS records correct zijn en wacht op propagatie

### Issue: "Domain Already in Use"
**Fix**: Verwijder domain uit andere Vercel project eerst

### Issue: "SSL Certificate Pending"
**Fix**: Wacht 5-10 minuten, Vercel genereert automatisch

---

## ✅ Final Checklist

- [ ] DNS records toegevoegd bij domain provider
- [ ] `my.blazewallet.io` toegevoegd aan wallet project
- [ ] Marketing website project aangemaakt
- [ ] `www.blazewallet.io` toegevoegd aan marketing project
- [ ] `blazewallet.io` toegevoegd aan marketing project
- [ ] SSL certificates actief (groene slot in browser)
- [ ] Test beide domains in incognito mode

---

## 📞 Support

Als je problemen hebt met DNS configuratie:
1. Check Vercel docs: https://vercel.com/docs/concepts/projects/domains
2. Use DNS checker: https://dnschecker.org
3. Contact je domain provider support
