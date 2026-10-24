# Gemini renewal status

Updated: 2026-10-24. Source: approved handoffs and the actual course mappings.
Use [AGENT-HANDOFF.md](AGENT-HANDOFF.md) for future work.

## Release status

- Version 29 already includes fourteen legacy activity replacements and refinements across nine packaged security units.
- Version 30 adds twelve medium-priority activity replacements to its release scope.
- Version 32 adds the reviewed recycling and password-hash redesigns: `ewastechute` and `hashblender`.
- Version 33 applies global wording polish across all 82 units, updates formal Taiwan Mandarin (zh-TW) terms, and conceals agent attribution tags.

The original “37” total counts 28 activity replacements and nine unit-level redesign items.
It is not a count of 37 individual slides. All 28 activity replacements are included through version 33.
Check the [live release marker](https://kids-tech.scsnake.xyz/release.json) for the deployed version and exact revision.
This file records implementation scope; it is not deployment proof.

## Hardware and compute: live in version 29

| Unit ID | Existing slide | Widget | Renewal |
|---|---|---|---|
| devices | 電腦是什麼？ | juicebox | Input, processing, and output through a juice machine. |
| devices | 口袋裡的電腦 | phonepeek | Desktop components shrink into a phone. |
| storage | 硬碟：會轉的圓盤 | hddseek | Spinning platter, seek arm, and shock response. |
| storage | 隨身碟和 SSD：不會動 | flashtrap | Electron trapping in flash storage. |
| gpu | CPU：幾位聰明大廚 | cpuchefs | Four cores process recipe tasks. |
| gpu | GPU：一大群小幫手 | gpusimd | Parallel workers process mosaic pixels. |
| gpu | AI 也愛用 GPU | aimath | CPU queue and GPU grid compare repeated arithmetic. |

Slide titles above must match the live source. Widget names are the exact implementation identifiers.

## Safety, network, and logic: live in version 29

| Unit ID | Widget | Renewal |
|---|---|---|
| safety | otpdefense | Protect verification codes from a scammer. |
| wifishop | packetsniff | Compare cafe Wi-Fi traffic with HTTPS protection. |
| wifishop | realwallet | Connect game purchases to real money and parental approval. |
| hacked | kickhacker | Recover account control and sign out an unauthorized device. |
| fakes | voiceclone | Check a cloned voice using a family secret and callback. |
| web | dnslookup | Look up a domain and address a request. |
| coding | ifcondition | Run visual if/else branches and observe the robot. |

## Packaged security units: live in version 29

These are unit-level changes, not nine single-slide replacements.
All nine units received Gemini redesign attribution. Five also received focused visual or interaction refinements.

| Unit ID | Unit | Gemini scope |
|---|---|---|
| websiteflow | 註冊、登入和登出 | Attribution across its existing activities. |
| webmemory | 網站記得什麼？ | Attribution across its existing activities. |
| loginsafety | 登入更安全 | Attribution across its existing activities. |
| ipports | IP 位址和連接埠 | Numbered server rooms and listening programs. |
| firewall | 防火牆 | Matching port labels and firewall-rule highlights. |
| vpn | VPN 虛擬私人網路 | Four route stations and a visible VPN tunnel. |
| trickdoors | 壞人怎麼讓你幫忙開門？ | Attribution across its existing activities. |
| antivirus | 防毒軟體能做什麼？ | Signature and behavior scanning scenes. |
| backupplan | 備份：還有另一份 | External-drive symbols and clear healthy/damaged states. |

These units already existed before the Gemini redesign release. Do not credit the badge-only changes as new unit creation.

## Medium-priority activities: version 30 release scope

| Unit ID | Existing slide identity | Widget | Renewal |
|---|---|---|---|
| devices | 桌機和筆電 | backpackfit | Pack portable devices into a backpack. |
| devices | 輸入還是輸出？ | workbench | Connect peripherals and observe signal direction. |
| battery | 充電安全 | charginghazards | Find and remove three charging hazards. |
| inside | 電腦裡面的好朋友 | deskrelay | RAM desk, storage shelf, CPU work, and power loss. |
| screens | 手機的超能力 | sensorheroes | Match four sensors to everyday situations. |
| web | 網址的三個部分 | urltrain | Assemble protocol, domain, and path carriages. |
| web | TLS：先握手，再說悄悄話 | tlshandshake | Complete a simplified TLS handshake. |
| attackers | 駭客想要什麼？ | assetdefense | Match safeguards to four digital assets. |
| networkattacks | 有人站在網路中間 | mitmforcefield | Compare HTTP interception with HTTPS protection. |
| freeapps | 廣告怎麼跟著你？ | cookiebackpack | Observe cookie tags and targeted advertising. |
| recommend | 停不下來？ | autoplaytug | Pause an autoplay loop and choose to rest. |
| clock | 時區 | globetime | Compare city times and the day/night boundary. |

The checked-in scope record is `tests/redesign/medium/manifest.json` at the repository root.
Production modules are `js/widgets-medium.js` and `js/medium/batch1.js` through `batch3.js`.
Styles are in `widgets-medium.css`. The original slide titles remain unchanged to preserve progress.

## Previously deferred activities: version 32 release scope

| Unit ID | Existing slide identity | Widget | Reviewed renewal |
|---|---|---|---|
| ewaste | 舊 3C 要丟哪裡？ | ewastechute | Sort used tissues and dry batteries; explain safe handling of damaged batteries. |
| passwordattacks | 網站不該存原密碼 | hashblender | Show the one-way concept and explain guessing; label the demonstration as illustrative. |

The owner deferred these two in version 30, then requested deployment after Gemini reviewed and redesigned them.
Their production modules are `js/medium/ewastechute.js` and `js/medium/hashblender.js`.
Original slide titles and saved progress identities remain unchanged. No activities in this batch remain deferred.

## Remaining catalog

This list records delivered Gemini work only. It does not classify every remaining course slide.
Do not assume all remaining slides are low priority or already reviewed.
Check the current source and the interaction review before selecting another batch.
