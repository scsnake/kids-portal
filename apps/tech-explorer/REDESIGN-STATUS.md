# Gemini renewal status

Updated: 2026-10-24. Source: approved handoffs and the actual course mappings.
Use [AGENT-HANDOFF.md](AGENT-HANDOFF.md) for future work.

## Release status

- Version 29 already includes fourteen legacy activity replacements and refinements across nine packaged security units.
- Version 30 preparation adds twelve medium-priority activity replacements. Deployment verification is pending.
- Two additional Gemini previews are deferred: `ewastechute` and `hashblender`. Their version 29 lessons remain unchanged.

The original “37” total counts 28 activity replacements and nine unit-level redesign items.
It is not a count of 37 individual slides. Two of those activities are excluded from this release.

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

## Medium-priority activities: version 30 candidate

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

## Deferred to Gemini

| Unit ID | Existing slide identity | Deferred widget | Required follow-up |
|---|---|---|---|
| ewaste | 舊 3C 要丟哪裡？ | ewastechute | Correct waste sorting and damaged-battery handling. |
| passwordattacks | 網站不該存原密碼 | hashblender | Explain password guessing accurately and label simulated hashes. |

Owner decision: bypass these two redesigns and let Gemini modify them.
Do not include them in a later release without a new preview, content review, and owner approval.
Their original Gemini source files remain outside the production bundle.

## Remaining catalog

This list records delivered Gemini work only. It does not classify every remaining course slide.
Do not assume all remaining slides are low priority or already reviewed.
Check the current source and the interaction review before selecting another batch.
