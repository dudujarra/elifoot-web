# ELIFOOT — DEEP TACTICAL REFERENCE FOR A FOOTBALL MANAGER GAME ENGINE

**Scope:** Historical roots → modern tactics (1925–2026), formation matrices, role taxonomy, statistical/mathematical models, and concrete formulas usable in a deterministic + stochastic match engine.

---

## 1. HISTORICAL EVOLUTION OF TACTICS

### 1.1 The Pyramid → WM (Chapman, Arsenal, 1925–1934)
After the 1925 offside rule change (from three defenders to two), Herbert Chapman pulled the centre-half back into defence and dropped the inside forwards to create the **WM (3-2-2-3)**. This was the first true tactical "system" in modern football and introduced the idea of *positional symmetry* — three defenders mirrored by three forwards, two halves mirrored by two inside forwards. It also produced the first specialist defender (the "stopper" CB).

### 1.2 Hungarian Withdrawal & Brazilian 4-2-4 (1950s)
Hungary's Mighty Magyars (Sebes, Puskás, Hidegkuti) introduced the **deep-lying centre-forward** — Hidegkuti dropping out of the WM's "W" tip, dragging England's stopper out of position (a tactical drag-out that prefigures the modern false-9). Brazil, drawing on this and Flávio Costa's *diagonal*, fielded a **4-2-4** at the 1958 World Cup (Zagallo dropping from a winger to a midfielder produced a fluid 4-3-3). This is the historical origin of the **back four**.

### 1.3 Catenaccio (Rocco, Herrera; 1950s–60s)
Born from the Swiss *verrou* of Karl Rappan, weaponised by Nereo Rocco (Padova, Milan) and perfected by Helenio Herrera at Inter (1960s). Structure: **1-4-3-2 with a libero** (sweeper) behind four man-markers. Philosophy: deny space, win possession via interception, attack via long counter to forwards (Suárez → Mazzola/Corso). Bequeathed three durable concepts: **the libero**, **man-marking + spare man**, **counter-attack as primary attacking phase**.

### 1.4 Total Football (Michels, Cruyff; Ajax 1969–73, Netherlands 1974)
Rinus Michels and Ștefan Kovács, with Cruyff as on-pitch director, fused zonal pressing, positional interchange, and a compressed playing field (high line + high press) into **Total Football**. Any outfield player could occupy any position; rotation was constant; the field was kept short vertically by squeezing up. This is the *philosophical root* of all modern pressing and positional play.

### 1.5 Sacchi's Milan (1987–1991) — Zonal 4-4-2
Arrigo Sacchi reduced football to four reference points: **ball, space, opponent, team-mate**. Tools: a strict zonal 4-4-2; **line of confrontation** (where to start pressing), **line of restraint** (where the back line holds); the four lines never separated by more than ~25 m vertically; collective offside trap; ball-side compression. Sacchi's Milan was arguably the most influential out-of-possession blueprint of the modern era — every back-four pressing team since (Klopp, Tuchel, Pochettino, Bielsa-disciples) descends from him.

### 1.6 Bielsa — Vertical Pressing & Man-Oriented Marking (1990s–2020s)
Marcelo Bielsa industrialised man-to-man pressing across the pitch ("**el loco**" Newell's, Argentina, Chile, Athletic, Marseille, Leeds). Trademarks: **+1 at the back** (back-three vs two strikers, back-four vs three), **3-3-1-3 or 4-1-4-1**, individual matchups all over the pitch, vertical passing, relentless verticality and second-ball contests. Pochettino, Sampaoli, and a generation of Argentine/Chilean coaches descend directly.

### 1.7 Cruyffian / Guardiola Positional Play — *Juego de Posición*
Cruyff's Barcelona (1988–96) → Guardiola's Barcelona (2008–12) → Bayern (2013–16) → Man City (2016–). Built on Juanma Lillo's framework, the system pursues **superiorities** through *position* — short passes to bait, long pass to the **free man**. Key concepts:

- **Five vertical lanes** (two touchlines, two half-spaces, one central) — never more than three players in the same vertical lane, never more than two in the same horizontal one.
- **3-2-5 / 3-box-3 attacking shape** — inverted full-backs (Zinchenko, Cancelo, Walker-as-3rd-CB, Stones-as-pivot) climb into the second line to form 3+2 build-up, 5 across the front.
- **Third-man combinations** — A passes to B, who lays off to C running in behind.
- **Quick possession + immediate counter-press** — 6-second rule to recover the ball.

### 1.8 Klopp / Rangnick **Gegenpressing**
Ralf Rangnick's Hoffenheim/Leipzig and Jürgen Klopp's Dortmund/Liverpool weaponised counter-pressing: the moment of loss is the moment of best attack because the opponent's structure is broken. Klopp's mantra: *"The best moment to win the ball is immediately after your team just lost it."* The **5-second rule** ("if not won back in 5 s, drop into mid-block"). Triggers: bad first touch, backward pass, sideline cul-de-sac, square pass under pressure. Out-of-possession primary shape: **4-3-3 / 4-2-3-1**; in-possession morphs to **3-2-5** with inverted full-back (Alexander-Arnold's later evolution).

### 1.9 Mourinho — Reactive Low-Block / Counter (2003–present)
Compact mid/low block, deny central channels, transition via long diagonals to wide forwards or a target striker. Famous instances: 2004 Porto, 2010 Inter (treble vs Barça), 2012 Real Madrid (counter masterclass). The defining anti-possession blueprint of the era.

### 1.10 Conte — 3-4-3 / 3-5-2 with Wing-Backs
Antonio Conte's Juventus and Chelsea (2016/17 PL title) made the **back-three + wing-backs** a modern staple. Strengths: aerial supremacy of three CBs, wing-back overloads, vertical channels for striker pair. Demands extreme physical wing-backs (Alonso, Moses, Hakimi).

### 1.11 Tuchel / Nagelsmann — Hybrid Back-Three, Asymmetric Build-ups
Tuchel (PSG, Chelsea, Bayern) and Nagelsmann (Hoffenheim, Leipzig, Bayern, Germany) popularised **phase-dependent shape-shifting**: 4-2-3-1 out of possession → 3-2-5 in possession by one full-back staying or one CM dropping; or 3-4-3 defending → 3-box-3 with wing-backs as wide forwards. Asymmetry is the rule: left side may build with an inverted full-back while the right uses an overlapping wing-back.

### 1.12 Pep's 2020s — The 3-2-5 / Box-Midfield
The 2022/23 Treble City: John Stones as a **hybrid CB / pivot**, Rodri as the lone #6, Gündoğan/De Bruyne as box-midfield #8s, Haaland as a fixed striker — a literal 3-2-5 in possession. Solved the "Haaland problem" (lone striker who pins the line) by overloading midfield from defence.

### 1.13 De Zerbi — Baiting Pressure
Sassuolo → Shakhtar → Brighton → Marseille. Build-up base **2-4-4 / 4-2-4** in possession. Centre-backs hold the ball with the **sole of the foot** to *bait* the press; goalkeeper acts as a third CB. Once a presser commits, automated rotations (third-man bounce, follow-the-press runs) skip the entire first line. Pep called him "one of the most influential managers in the last 20 years."

### 1.14 Postecoglou — Relentlessly High Line
Ange Postecoglou (Yokohama, Celtic, Spurs). Possession-dominant 4-3-3, inverted full-backs into midfield, **back line almost on the halfway line** for nearly all 90 minutes — accept long-ball/transition risk in exchange for permanent territorial dominance. The polar opposite of Mourinho.

### 1.15 Modern Forward Archetypes
- **False-9**: drops from the CF line to overload midfield (Messi 2009–2012, Firmino 2015–22).
- **Inverted winger**: left-footer on the right, right-footer on the left, cutting inside to shoot or combine (Robben, Salah, Vinícius).
- **Inside forward**: like an inverted winger but starts narrower, in the half-space.
- **Raumdeuter** ("space interpreter"): Thomas Müller — no fixed position, finds vacant zones in the final third.

---

## 2. FORMATIONS — EXHAUSTIVE REFERENCE

For each: defensive shape, in-possession shape, strengths/weaknesses, counters, key teams, position profiles.

### 2.1 4-4-2 (Flat)
- **Defensive:** two banks of four, two strikers pressing CBs. Vertical compactness ~25 m.
- **In-possession:** typically morphs to 4-2-4 wide or 4-4-2 box if FBs push up.
- **Strengths:** simplicity, two-striker pressure, lateral coverage, classic English/Italian rhythm.
- **Weaknesses:** central-midfield 2v3 vs a 4-3-3; FBs isolated vs inverted wingers.
- **Beats:** narrow systems (3-5-2 with no wide forwards), 4-3-3 if midfield 2 are box-to-box destroyers.
- **Beaten by:** 4-3-3 with a #6 (midfield numerical superiority), 4-2-3-1 (#10 between the lines).
- **Famous teams:** Sacchi's Milan, Ferguson's United (1999), Simeone's Atlético.
- **Profiles:** big-strong CBs, hard-tackling CMs, two-way wingers, target + poacher upfront.

### 2.2 4-4-2 Diamond
- **Defensive:** narrow; CMs and #10/CDM form rhombus.
- **In-possession:** FBs are the only width; striker pair drops/peels.
- **Strengths:** central overload, two-striker box presence, #10 enjoys space.
- **Weaknesses:** **chronically vulnerable on flanks** if FBs are pinned.
- **Beats:** other narrow systems and 4-3-3 without inverted wingers.
- **Beaten by:** **width-heavy 4-3-3 / 3-4-3** that pin the FBs.
- **Famous:** Ancelotti Milan (Pirlo at base), Klopp Liverpool's mid-2010s experiments.

### 2.3 4-3-3 (with #6 Holding)
- **Defensive:** 4-1-4-1 / 4-5-1 with wingers tucking.
- **In-possession:** 3-2-5 if a FB inverts and a CM advances; or 2-3-5 with both FBs high.
- **Strengths:** midfield triangle, balanced pressing, two wide attackers.
- **Weaknesses:** demands an elite #6 (Rodri, Busquets, Casemiro); two wide CBs vs three strikers if #6 advances.
- **Beats:** 4-4-2 (3v2 midfield), 4-2-3-1 if #6 dominates the #10.
- **Beaten by:** 3-5-2 (overload central, isolate wide CBs in transition).
- **Famous:** Guardiola Barça, Klopp Liverpool 2018–22.

### 2.4 4-3-3 Double Pivot Variant (= 4-2-3-1 with the #10 advanced)
Two #6s, single #8 ahead — Tuchel Chelsea, Real Madrid 2022–24 (Kroos+Casemiro+Modrić).

### 2.5 4-2-3-1
- **Defensive:** 4-4-1-1, #10 screening or pressing.
- **In-possession:** 2-4-4 / 3-2-5 with FBs pushing.
- **Strengths:** the most balanced modern system; #10 between lines is a creativity engine; double pivot protects.
- **Weaknesses:** lone striker can get isolated; #10 must defend or team becomes 4-2-4 defensively.
- **Beats:** flat 4-4-2 (#10 lives between lines).
- **Beaten by:** man-marked #10 (3-5-2 with a man on the #10), aggressive pressing on the double pivot.
- **Famous:** Mourinho Real Madrid, van Gaal Bayern, modern German national teams.

### 2.6 3-5-2
- **Defensive:** 5-3-2 with wing-backs dropping.
- **In-possession:** 3-3-4 / 3-1-4-2 / 3-2-5.
- **Strengths:** three CBs vs two strikers = **+1 free man**; midfield 5v3 vs 4-3-3 central; two-striker presence.
- **Weaknesses:** wing-backs must cover ~70 m channel; wide CBs exposed in transition.
- **Beats:** two-striker back-four systems; possession sides without wide forwards.
- **Beaten by:** **3-at-the-back with wide forwards (3-4-3)** that pin the wing-backs; or 4-3-3 that overloads one wide CB 2v1.
- **Famous:** Conte Juventus, Inter 2021 Scudetto (Antonio Conte), Simeone Atlético variants.

### 2.7 3-4-3
- **Defensive:** 5-4-1 / 5-2-3.
- **In-possession:** 3-2-5 with wing-backs as forwards.
- **Strengths:** five attacking presences; central 3v2 build-up vs two pressers.
- **Weaknesses:** thin midfield (only 2 CMs) vs a true midfield three.
- **Beats:** 4-4-2, 4-2-3-1 if CMs win the 4v4.
- **Beaten by:** 4-3-3 / 3-5-2 that outnumbers the CMs in midfield.
- **Famous:** Conte Chelsea 2016/17, Tuchel Chelsea 2021 UCL win.

### 2.8 3-4-2-1
- **Defensive:** 5-4-1.
- **In-possession:** 3-2-5 with two #10s in half-spaces.
- **Strengths:** half-space occupation is *positional perfection*; wing-backs supply width.
- **Weaknesses:** lone striker; demands two creative #10s with running power.
- **Famous:** Conte Tottenham (limited success), Postecoglou variants, modern Brighton sub-shapes.

### 2.9 4-1-4-1
- **Defensive:** rigid two banks of four/five with single pivot.
- **In-possession:** 4-3-3 / 2-3-5.
- **Strengths:** outstanding mid-block compactness, pressing trigger via wide CMs.
- **Weaknesses:** lone striker; #6 isolated vs two #10s.
- **Famous:** Bielsa Leeds, early Klopp Liverpool defending.

### 2.10 4-3-2-1 ("Christmas Tree")
Two narrow #10s behind a striker. Ancelotti Milan with Kaká/Seedorf/Rui Costa. **Beats:** central-midfield-poor sides. **Beaten by:** wide overloads.

### 2.11 5-3-2 / 5-4-1
Pure defensive shells. Low-block ambush systems. Used by lesser sides vs giants (e.g., promoted Premier League teams; Greece 2004). Strengths: deep compactness, three CBs + wing-backs vs crossing. Weaknesses: invites territorial pressure; needs elite counter-attack pace.

### 2.12 4-4-1-1
Withdrawn #10 / second striker. Useful for asymmetric pressing: #10 marks #6, striker shadows CB. Diego Forlán/Tévez roles.

### 2.13 3-1-4-2
Rare modern shape. One pivot, four ahead, two strikers — extreme central overload, very narrow.

### 2.14 Asymmetric Modern Shapes
- **Pep 3-2-5**: e.g., Stones/Rodri pivot, Walker as wide-CB, inverted left-FB, two #8s, two wingers + striker.
- **Tuchel 4-2-2-2 / 3-4-3 hybrid**.
- **Arteta 3-2-5**: Zinchenko inverted, Saliba/Gabriel/White as back-three, Saka/Martinelli as wide forwards.

### Formation Rock-Paper-Scissors Matrix

| Attacking shape ↓ / Defending → | 4-4-2 flat | 4-3-3 (#6) | 4-2-3-1 | 3-5-2 | 3-4-3 | 5-4-1 |
|---|---|---|---|---|---|---|
| **4-4-2 flat** | even | LOSE (midfield 2v3) | LOSE (#10 free) | LOSE (mid 2v3) | even | WIN (2 strikers vs 3 CBs) |
| **4-3-3 (#6)** | WIN | even | even | LOSE (mid 3v5) | WIN | LOSE (low-block) |
| **4-2-3-1** | WIN | even | even | even | WIN | LOSE |
| **3-5-2** | WIN | WIN (mid 5v3) | even | even | LOSE (wide forwards pin WB) | WIN |
| **3-4-3** | WIN | LOSE (mid 2v3) | LOSE | WIN | even | WIN (wide overload) |
| **4-2-3-1 with high press vs 4-4-2 build** | WIN clearly | — | — | — | — | — |

(Implement as a base multiplier ∈ {0.85, 1.00, 1.15} on zone control, then modulated by personnel quality.)

---

## 3. POSITIONS AND ROLE NUANCES

### 3.1 Goalkeepers
- **Shot-stopper (classic)**: reflexes, positioning, command of area. Buffon, Casillas. Attributes weighted to *reflexes, one-on-ones, aerial reach, concentration*.
- **Sweeper-keeper (Neuer archetype)**: high defensive line requires GK to act as outermost defender. Demands *pace, rushing out, anticipation, kicking, first touch*. Modern: Neuer, Ederson, Alisson, ter Stegen.
- **Distribution range** is the new differentiator — Ederson can hit a 60-yard pass to a winger's feet. Game stat: *Throwing*, *Kicking*, *Long-pass accuracy*. (StatsBomb tracks GK distribution distance and target zones.)
- **Cross-claiming** is a separate attribute (e.g., Premier League sides facing crossing games need high "aerial reach + command").
- *Neutralises*: high lines under pressure (because they can clear long); narrow long-balls.
- *Neutralised by*: high crossing volume; aggressive press on the GK if his feet are poor.

### 3.2 Centre-backs
- **Ball-playing CB (BPD)**: line-breaking passes, calm under press. Rüdiger, Stones, Saliba, Marquinhos. Stats: *passing, composure, technique, first touch*. Required by any possession side.
- **Stopper / no-nonsense CB**: aerial dominance, last-ditch tackling. Van Dijk (hybrid), Koulibaly, Kim Min-jae. Stats: *heading, strength, tackling, marking, aggression*.
- **Libero / sweeper**: behind the line, reads play, steps in to break lines (Beckenbauer historical; modern: Lúcio, Thiago Silva in certain phases).
- **Wide CB in back-three**: defends 1v1 wide, steps into midfield (Rüdiger at Chelsea right-side, Bastoni at Inter left). Hybrid pace + passing.
- **Inverted CB (modern Pep)**: a CB who drifts inside (Stones / Akanji) to become a #6.
- *Drag-out problem*: a stopper CB without pace is destroyed by a false-9 who pulls him out of the line, exposing the channel.

### 3.3 Full-backs
- **Traditional overlapping** (Cafu, Maicon, Roberto Carlos, Alphonso Davies): pace, stamina, crossing, late forward runs.
- **Inverted full-back** (Zinchenko, Cancelo, Akanji, Stones): tucks into central midfield to form 3+2 build-up. Stats: *passing, vision, positioning, technique*. Reduces transition risk; creates 4v2/4v3 in midfield.
- **Attacking wing-back** (Hakimi, Reece James, Alphonso Davies): essentially a winger with defensive duty. Highest physical demand of any outfield role.
- **Defensive full-back**: shut-down 1v1 defender (Aurier-type, Kyle Walker at certain phases). Pace + 1v1 defending.
- **Underlapping FB** (Trent Alexander-Arnold's 2023–24 hybrid): runs into the half-space rather than the touchline.

### 3.4 Defensive Midfielders
- **#6 Anchor / Destroyer** (Makelele, Kanté, Casemiro, Fabinho): tackling, interceptions, positioning, stamina. *Reads the game and breaks attacks before they form.*
- **Regista / Deep-lying Playmaker** (Pirlo, Xabi Alonso, Jorginho, Rodri): switches play, dictates tempo, low turnover, long-range vision. Stats: *passing, vision, technique, composure*. Press-resistance is *the* hidden attribute.
- **Double-pivot** (Rodri+Kovačić, Casemiro+Modrić as 6+8, Xhaka+Partey): one ball-winner + one playmaker, or two box-to-box. Provides 2v1 numerical superiority vs a single #10.
- **Inverted Pivot** (a CM dropping between CBs — *salida lavolpiana*): creates a back-three in build-up.

### 3.5 Central Midfielders (#8s)
- **Box-to-box** (Vieira, Gerrard, Bellingham): all-action, late-runner. Stats: *stamina, work rate, long-shot, off-ball, tackling*.
- **Mezzala** (literally "half-winger" — Kroos right-side at Real, De Bruyne, Gündoğan, Modrić in their #8 roles): operates in the half-space, combines with wingers, late runs into the box.
- **Half-space runner / shadow striker** (Müller, Foden, Bellingham 2023–24).
- **Deep-lying playmaker** (regista, see above).

### 3.6 Attacking Midfielders / #10s
- **Classic #10** (Zidane, Riquelme, Özil, De Bruyne when central): vision, killer ball, free between the lines. Stats: *vision, passing, technique, first touch, dribbling*.
- **False-9** (Messi 2009–12, Firmino 2015–20, Foden in some games): a striker who plays as a #10, dragging CBs out of the line.
- **Second striker / Mediapunta** (Tévez, Forlán, Bergkamp, Saka in some roles).
- **Wide #10** (Bernardo Silva for City, Mbappé in PSG hybrid roles).

### 3.7 Wingers
- **Traditional touchline winger** (Ribéry, Robben old-school, Mané left): hugs sideline, crosses or beats FB to byline. *Pace, crossing, dribbling*.
- **Inverted winger** (Robben right, Salah right, Vinícius left, Saka right, Sané, Leão): cuts inside on the strong foot, shoots or combines. *Pace, finishing, long shot, technique*.
- **Inside forward**: starts narrow in the half-space, third striker positioning (Henry in Wenger's Arsenal late, Son Heung-min some games).
- **Wing-forward** (the modern hybrid): asymmetrically advanced winger acting as a second striker.

### 3.8 Strikers
- **Target man** (Drogba, Lukaku, Giroud, Wout Weghorst): aerial, hold-up play, lay-offs. *Strength, heading, jumping reach, first touch, composure*.
- **Poacher** (Inzaghi, Gabriel Jesus phases, Vardy): six-yard-box predator. *Positioning, finishing, anticipation, off-ball*.
- **Complete forward / #9** (van Basten, Henry, Lewandowski, Haaland, Mbappé): all attributes. The ideal modern striker.
- **False-9** (covered above).
- **Pressing forward** (Firmino, Roberto, Gabriel Jesus, Darwin Núñez): triggers the press, work rate as much as goals. *Stamina, work rate, aggression, positioning*.
- **Raumdeuter / Space-finder** (Müller): no positional reference, finds vacated zones. *Off-ball, anticipation, vision*. Underrated role for game design: a "ghost" forward who triggers when zones are vacated.

---

## 4. PLAYER-vs-PLAYER MATCHUPS (FOR THE ENGINE)

| Matchup | Attacker advantage | Defender advantage | Engine variable |
|---|---|---|---|
| Pacey winger vs slow FB | Pace > FB pace by ≥3 → high-success 1v1 dribble; cross/cutback xT spike | FB jockeys, forces inside | `min(pace_W − pace_FB)`, `dribble_W`, `1v1_def_FB` |
| Inverted winger vs overlapping FB | Creates 2v1 with own FB outside; winger cuts inside on strong foot | FB with high 1v1 + work-rate FB tracking back | `chemistry(W, FB_own)`, `crossing_FB_own` |
| Target man vs ball-playing CB | Holds up, aerial wins, brings runners in | Stopper CB with strength edge | `heading_TM` vs `heading_CB`, `strength` weighted 0.6 |
| Target man vs sweeper CB | Wins aerial behind line | Pace recovery on long balls | `pace_CB` mitigates `direct_play` |
| False-9 vs stopper CB | Drags out, opens channel for inside-forward run | A libero/sweeper picks him up; midfielder steps up | Trigger event: **drag-out** if `CB_aggression > 13 ∧ pace_CB < 13` |
| #10 vs single pivot | Operates between lines, 1v1 on #6 if #6 commits | Compact 4-1-4-1 + #6 stays | `passing_#10 × vision_#10` vs `positioning_#6 + tackling_#6` |
| #10 vs double pivot | 1v2, harder | Easy doubling | Numerical mod ×0.8 to creative output |
| High press vs ball-playing GK | Forces long balls if GK technique low | GK technique > 14 + composure beats press, finds free man | Trigger: `press_intensity > 0.7 ∧ GK_passing < 12` → `xG_against_press +12%` |
| Low block vs creative #10 | If #10 has long-shot + set-piece quality, opens scoring | Compact lines deny pockets | Add `long_shot` term × `space_in_18` (≈0 vs low block) |
| Wing-back vs wide midfielder (3-5-2 vs 4-4-2) | WB has free run if WMid doesn't track | If WMid stays, FB is free in build-up | `work_rate_WMid` decisive |
| Pacey forward vs high line | Through-ball exploitation | High line + sweeper-keeper | `pace_F − pace_CB` × `through_ball_attempts` |
| Aerial striker vs short CB | Crossing routine becomes high-xG | Aerial CB neutralises | `heading + jumping_reach` vs CB equivalent |
| Mezzala vs single pivot | 2v1 in half-space with winger and #6 dragged | Compact ball-side midfield with three CMs | Half-space control multiplier |
| Box-to-box vs pure #6 | Late runs unmark him | #6's positioning + anticipation reads run | `off_ball_B2B` vs `anticipation_#6` |

**General trait counters:**
- *Pace* counters high line.
- *Press-resistance / technique* counters press.
- *Aerial ability* counters crossing.
- *Work rate* counters overlapping/inverted FBs.
- *Long shot* counters low block.
- *Vision + through-balls* counters man-marking (free man).
- *Stamina* counters gegenpressing over 90 minutes.

---

## 5. TEAM-LEVEL ROCK-PAPER-SCISSORS

| Style A (attacking) ↓ vs Style B (defending) → | High press | Mid-block | Low block + counter | Possession | Gegenpressing | Direct/long-ball |
|---|---|---|---|---|---|---|
| **Build from back / possession** | LOSE if technique low; WIN if technique high & GK distributes | EVEN | LOSE in xG/90 (struggle to break) | EVEN | LOSE (one error → goal) | WIN (control) |
| **Long-ball / direct** | WIN (bypass) | EVEN | EVEN | LOSE | LOSE (gives up 2nd balls) | EVEN |
| **Counter-attack / low-block** | EVEN | EVEN | EVEN (boring) | WIN | EVEN | LOSE |
| **Wing-play / crossing** | EVEN | EVEN | EVEN | EVEN | EVEN | WIN |
| **Overload-and-isolate switch** | WIN | WIN | EVEN | EVEN | EVEN | EVEN |
| **Gegenpressing high** | EVEN | WIN | EVEN | WIN if possession is slow | EVEN | LOSE |

### Key Specific Counters
- **High press vs build-from-back**: works *only* if pressers have stamina and CBs/GK have low press-resistance.
- **Gegenpressing vs slow possession**: gegenpress feeds on slow circulation — opponent loses the ball, you counter in 8 s. Beat it with one-touch quick possession (Pep's Barça vs Klopp's Dortmund 2013–14).
- **Low-block vs possession-dominant**: classic upset formula (Inter 0-1-0 Barça 2010, Chelsea vs City 2021 UCL final).
- **Wing-crossing vs narrow diamond**: diamond's FBs are isolated → 2v1 on the flank.
- **Switch play vs man-marking**: change of side leaves marker chasing 40 m.
- **3-at-back vs two-striker systems**: classic +1 free man at the back.
- **Back-four vs lone striker + two #10s**: the two #10s split the centre-backs, two free vs four. Counter: one CM screens, or use 3-CB shape.

---

## 6. PHASES OF PLAY

### 6.1 In-Possession Phases
1. **1st phase (build-up)**: from GK/CBs in own third. Tactics: 3+2 (inverted FB), 2+3 (double pivot drops one CB-wide), Salida Lavolpiana (CM between CBs).
2. **2nd phase (progression)**: through the middle third — third-man combinations, line-breaking passes, switches.
3. **3rd phase (final third / chance creation)**: cutbacks, near-post runs, low crosses, half-space cut-ins, set-piece-from-open-play.

### 6.2 Defensive Phases
- **High block / high press** (line of confrontation in opp half).
- **Mid-block** (line ~10–15 m own side of halfway).
- **Low block** (defensive third, two banks).

### 6.3 Transitions
- **Offensive transition (counter-attack)**: 6 s window after winning ball; 3–4 forward runners; vertical first pass. Key metric: time-to-shot. Mourinho/Klopp masters.
- **Defensive transition (rest defense)**: structure left behind during attack to prevent counter. Pep's "3+1" rule: 3 CBs + 1 pivot remain when attacking. **Rest defense quality = (defenders + pivot) − (opp counter-runners)**.

### 6.4 Counter-Pressing Windows
- **5-second rule (Klopp)**: if not won back in 5 s, drop into block.
- **6-second rule (Pep Barça)**: similar.
- **Triggers**: bad first touch, backward pass under pressure, sideline cul-de-sac, head-up scanning pause.

### 6.5 Set Pieces
- **Corners — zonal**: defenders in fixed zones (near-post, 6-yard line, far-post). Used by Liverpool, Arsenal.
- **Corners — man marking**: defenders track specific attackers. Used by Spanish/Italian sides historically.
- **Hybrid**: 4 zonal + 3 man-markers + 1 on the keeper.
- **Attacking routines**: near-post flick (Liverpool 2018–22), short corner combinations, deep corner to far-post header, low driven across face.
- **Throw-ins**: Liverpool hired Thomas Grønnemark as a throw-in coach (2018). Long throws (Stoke 2008, Brentford 2023–25 under Frank with Toney) generate set-piece xG of ~0.04–0.06 per throw in attacking third.
- **Free-kicks**: direct (Pirlo, Messi, Beckham, Calhanoglu, Ward-Prowse, Trippier); indirect (training-ground routines).
- **Set-piece xG model**: features = location, type (corner/FK/throw), height (1st-, 2nd-ball), defender setup, taker quality. Set-piece xG accounts for ~25–30% of all goals in modern football.

---

## 7. KEY TACTICAL CONCEPTS

### 7.1 The Five-Lane / Half-Space Theory
Pitch divided vertically into five lanes: 2 touchlines, 2 **half-spaces** (between touchline and the central lane), 1 central lane. Rules: don't have >2 players in same horizontal line, don't have >3 in same vertical lane. The **half-space** is the most important zone in modern football: a player there can pass forward, backward, inside, or to the wing — *maximum angles*. Bellingham/Foden/Müller/Mahrez are half-space specialists.

### 7.2 The Four (Five) Superiorities (Lillo / Guardiola)
1. **Numerical superiority** — more players than opponent in the relevant zone (3v2 build-up, 5v4 attack).
2. **Positional superiority** — better positioning, even if equal numbers (player between lines, behind midfield).
3. **Qualitative superiority** — your player is technically/physically better in the 1v1 (Mbappé vs any FB).
4. **Dynamic superiority** — you arrive into space with momentum the defender lacks (a runner from deep meets a static defender).
5. **Socio-affective superiority** (Lillo's 5th) — team automatisms, shared understanding, repeated patterns — the kind De Zerbi's Brighton exhibited.

For the game engine, each zone of the pitch has a **superiority score per team** computed each tick:
$$S_{\text{zone},t} = w_1 \Delta N + w_2 \Delta P + w_3 \Delta Q + w_4 \Delta D$$

where $\Delta N$ = numerical diff, $\Delta P$ = positional diff (e.g., between-lines bonus), $\Delta Q$ = quality diff (sum of weighted attributes), $\Delta D$ = dynamic diff (velocity * momentum).

### 7.3 Third-Man Combinations
A → B → C, where C is the actual receiver. B is the bait. Defining pattern of modern positional play.

### 7.4 Cutbacks & Low Crosses
Statistically the highest-xG type of cross. Pass from byline back to the penalty spot has ~0.20–0.30 xG. Game engine should weight cutback events much higher than high crosses.

### 7.5 Overloads & Isolations
Overload one side to force the opponent to shift, then *switch* to the weak side where a 1v1 isolation has been created. Pep, Klopp, Arteta all use this.

### 7.6 Compactness
- **Vertical compactness**: distance from highest defender to highest forward when defending (Sacchi: ≤25 m).
- **Horizontal compactness**: distance from ball-side touchline to opposite-side midfielder.

### 7.7 Pressing Traps & Triggers
A trap is when a team *appears* to leave a passing lane open, only to spring the press once the ball arrives. Bielsa, Tuchel, Klopp use the touchline as a natural trap.

### 7.8 Defensive Line Management
- **Line of confrontation**: where you start pressing (e.g., halfway line for high block).
- **Line of restraint**: where the back line holds.
- Distance between them = vertical compactness.

### 7.9 Free Man Concept
The cornerstone of positional play. There is always a free man (since 11v11 = always a free player in some zone). Tactical work = finding him.

### 7.10 Rest Defense
The 3+1 / 4+1 / 3+2 structure left behind during attack. Pep keeps Stones + Akanji + Dias + Rodri; Liverpool kept Van Dijk + Matip + Fabinho.

---

## 8. STATISTICS, MODELS & MATHEMATICS

### 8.1 Expected Goals (xG)
A logistic-regression or boosted-tree model estimating probability of a shot becoming a goal.

**Features (standard)**:
- shot location (x, y) → distance and angle to goal
- body part (foot, head, other)
- shot type (open play, fast break, set piece, penalty, free kick)
- pattern of play (cross, through-ball, rebound, dribble)
- defender locations (StatsBomb 360 has frame data)
- GK position
- assist type, prior action

Model:
$$P(\text{goal}|s) = \sigma\left(\beta_0 + \sum_i \beta_i x_i\right)$$

Standard providers: Hudl StatsBomb, Opta/StatsPerform, Understat, FBref/StatsBomb. Karun Singh's open xG implementations and Statsbomb's "xG with freeze frame" (using defender locations) are state-of-the-art.

### 8.2 Expected Assists (xA)
The xG of the shot that the pass directly created, conditional on the pass being completed. Sums to a creative output metric.

### 8.3 Expected Threat (xT) — Karun Singh (2019)
Pitch divided into 16×12 = 192 zones. Each zone has:
- $s_{x,y}$ = probability of shooting from this zone (given possession).
- $m_{x,y}$ = probability of moving the ball (pass/carry); $s + m = 1$.
- $g_{x,y}$ = goal probability if shooting.
- $T_{(x,y)\to(z,w)}$ = move transition matrix (where the ball ends up).

**Recursive formula**:
$$\boxed{\;xT_{x,y} = s_{x,y}\,g_{x,y} + m_{x,y} \sum_{z=1}^{16}\sum_{w=1}^{12} T_{(x,y)\to(z,w)}\, xT_{z,w}\;}$$

Solved iteratively (4–5 iterations converge; physical interpretation = scoring within next 4–5 actions). A pass's value is $xT_{\text{end}} - xT_{\text{start}}$.

Worked example (Singh's original): a pass from a corner-flag zone (xT ≈ 0.068) to the edge of the box (xT ≈ 0.176) is valued **+0.108** xT, i.e., increased scoring chance in next 5 actions by 10.8%.

### 8.4 Expected Possession Value (EPV) — Fernández, Bornn, Cervone (2019)
Decomposes value of a state into pass / shoot / dribble options:
$$\text{EPV} = P(\text{pass})\cdot \mathbb{E}[V|\text{pass}] + P(\text{shoot})\cdot \mathbb{E}[V|\text{shoot}] + P(\text{dribble})\cdot \mathbb{E}[V|\text{dribble}]$$

Uses tracking data to model expected reward conditional on action — more granular than xT because it accounts for *who* is making the decision and *where* defenders are.

### 8.5 VAEP — Valuing Actions by Estimating Probabilities (Decroos, Bransen, Van Haaren, Davis — KU Leuven, 2019)
Frames action valuation as a binary classification of short-term (next 10 actions) outcomes. For game state $S_i$ and team $t$:

$$V(S_i, t) = P_{\text{scores}}(S_i, t) - P_{\text{concedes}}(S_i, t)$$

Action $a_i$ moves the game from $S_{i-1}$ to $S_i$. The VAEP value of $a_i$ is the change:
$$\text{VAEP}(a_i) = \Delta P_{\text{scores}} - \Delta P_{\text{concedes}}$$

State features: location, action type, body part, time, prior actions. Open implementation: `socceraction` (Python; ML-KULeuven). Major advantages over xT: (1) values *every* action type; (2) accounts for *defensive* value; (3) context-aware (game state). Reference: Decroos et al., *Actions Speak Louder Than Goals*, SIGKDD 2019 (arXiv:1802.07127).

### 8.6 g+ (Goals Added) — American Soccer Analysis
Similar to VAEP, decomposes match into actions, values each via win-probability-style modelling tailored to MLS data. Open methodology.

### 8.7 PPDA — Passes Per Defensive Action
$$\text{PPDA} = \frac{\text{opp. passes in their own 60\% of the pitch}}{\text{your tackles + interceptions + challenges + fouls in same zone}}$$

(The pressing team operates in the *opponent's* defensive 60%). Wyscout's standardised area: 40% nearest one's *own* goal is excluded.

Interpretation:
- 4–8: aggressive high press (Klopp 2018–20 Liverpool, Pep City).
- 9–12: mid-block selective pressing.
- 13+: low/mid-low block (Mourinho late, Simeone sometimes).

Top-5-league season averages hover ~11.0 (2018/19).

### 8.8 Field Tilt
$$\text{Field Tilt} = \frac{\text{Your final-third touches}}{\text{Your + Opp final-third touches}}$$

Better than possession % for measuring territorial dominance. Pep's City often ~75% field tilt.

### 8.9 Packing — Impect (Stefan Reinartz, Jens Hegeler)
A pass or dribble's **packing rate** is the number of opponents *bypassed* between the ball's start and end positions. A pass from one's own half over five defenders has packing of 5. **Impect** is the same but specifically counts *defenders* bypassed (not midfielders). Used to value progressive actions independently of where they happen.

### 8.10 Progressive Passes / Carries (FBref / StatsBomb)
A pass/carry is **progressive** if it moves the ball at least 10 yards toward the opponent's goal from its furthest point in the last six passes, *or* into the penalty area. Excludes plays in the defending 40% of the pitch.

### 8.11 Pass Networks & Centrality
Build a directed weighted graph $G = (V, E)$ where vertices = starting XI, edges = number of passes between players.

Useful measures:
- **Degree centrality**: number of distinct teammates passed to/from.
- **Betweenness centrality**: how often the player sits on shortest paths — identifies the "playmaker hub".
- **Eigenvector centrality**: connected to other well-connected players.
- **Network density**: $\frac{\text{actual edges}}{\text{possible edges}}$ — possession sides tend toward >0.6.

### 8.12 Voronoi Diagrams (Taki & Hasegawa 1996)
Naive pitch control: each pitch point is "controlled" by the *nearest* player. Simple geometry; ignores velocity. Still useful for static snapshots.

### 8.13 Pitch Control Models (Spearman, 2018 — *Beyond Expected Goals*, MIT Sloan)
Spearman's **Potential Pitch Control Field (PPCF)**: at every pitch location $\mathbf{r}$, compute, for each player $i$, the expected time-to-control $\tau_i(\mathbf{r})$ given current position $\mathbf{x}_i$, velocity $\mathbf{v}_i$, max speed (typical 5 m/s), and reaction time (typical 0.7 s). Control probability:

$$P_i(\mathbf{r}, t) = \sigma\!\left(\frac{t - \tau_i(\mathbf{r})}{\sigma_\tau}\right)$$

with $\sigma$ a logistic function (Spearman prefers logistic over normal for heavy tails).

Compute scoring value at $\mathbf{r}$ from chain:
$$P(\text{goal}) = \int_\text{pitch} P(\text{ball arrives at } \mathbf{r}) \cdot P(\text{control}|\text{arrival}) \cdot P(\text{score}|\text{control at } \mathbf{r})\, d\mathbf{r}$$

Implementation refs: Laurie Shaw's `LaurieOnTracking` repo; the bqplot interactive `InteractivePitchControl`.

### 8.14 Off-Ball Scoring Opportunities (OBSO) — Spearman
Builds on PPCF — for any moment, calculate the chance of an off-ball player scoring within $n$ actions, given a hypothetical pass to that location. Identifies *who creates space* even without touching the ball.

### 8.15 xGChain, xGBuildup (Thom Lawrence, 2018)
- **xGChain**: the total xG of any possession the player was involved in (any touch in the chain).
- **xGBuildup**: xGChain excluding shots and key passes — pure build-up contribution. Highlights deep playmakers (Rodri, Jorginho).

### 8.16 Press-Resistance Metrics
Typical: % of passes received under pressure that are then completed; turnover rate under pressure; expected pass completion vs actual under pressure. Statsbomb has a freeze-frame-based "press_under" flag.

### 8.17 Defensive Metrics
- **Tackles won %**.
- **Pressures / 90** (StatsBomb's pressure event).
- **Pressure success rate**: % of pressures leading to turnover within 5 s.
- **Ball recoveries**.
- **Interceptions**.
- **Aerials won %**.
- **Adjusted versions** that account for team possession (a low-possession team will rack up defensive numbers).

### 8.18 Player Similarity / Embeddings
Build a feature vector per player (per-90 stats, normalised by position). Compare via cosine similarity:
$$\text{sim}(p, q) = \frac{\mathbf{v}_p \cdot \mathbf{v}_q}{\|\mathbf{v}_p\|\,\|\mathbf{v}_q\|}$$

Or train a neural embedding using pass-network roles. Useful for "find me the next ___" scouting.

### 8.19 Markov Chain Possession Models
Original use: Sarah Rudd's 2011 OptaPro talk *"A framework for tactical analysis... using Markov chains"* — the conceptual ancestor of xT. State = pitch zone + possession + action; transitions estimated from data; reward = goal probability. xT is essentially a simplified absorbing Markov chain.

### 8.20 Public Datasets

| Dataset | Type | Content | Source |
|---|---|---|---|
| **StatsBomb Open Data** | Event + 360 freeze-frames | 2022 + 2018 Men's WC, Euro 2024 + 2020, Copa América 2024, AFCON 2023, Women's WCs 2019/2023, Euro 2025/2022, UCL finals, NWSL, Cruyff/Messi/Pep career sets | github.com/statsbomb/open-data |
| **Wyscout Open** | Event | Top-5 leagues 2017/18, Euro 2016, 2018 WC | figshare.com (collection 4415000) |
| **Metrica Sports Sample** | Tracking + event | 3 anonymised matches | github.com/metrica-sports/sample-data |
| **SkillCorner Open** | Broadcast tracking | ~10 matches incl. A-League 2024/25 | github.com/SkillCorner/opendata |
| **Last Row / FoTD** | Tracking | 19 Liverpool 2019 goals | github.com/Friends-of-Tracking-Data-FoTD |
| **SoccerNet** | Video + events | broadcast-derived dataset for action spotting | soccer-net.org |

### 8.21 Reference Papers
- **Decroos, Bransen, Van Haaren, Davis (2019)** — *Actions Speak Louder than Goals*. SIGKDD. (VAEP)
- **Spearman (2018)** — *Beyond Expected Goals*. MIT Sloan Sports Analytics Conference. (Pitch control + OBSO)
- **Fernández, Bornn, Cervone (2019)** — *Decomposing the Immeasurable Sport: A Deep Learning Expected Possession Value Framework*. MIT Sloan. (EPV)
- **Singh, K. (2019)** — *Introducing Expected Threat (xT)*, karun.in blog.
- **Van Roy, Robberechts, Decroos, Davis (2020)** — *Valuing On-the-Ball Actions in Soccer: A Critical Comparison of xT and VAEP*. AAAI Workshop.
- **Rudd, S. (2011)** — *A Framework for Tactical Analysis... Using Markov Chains*. OptaPro Forum. (Markov ancestor of xT)
- **Taki & Hasegawa (1996, 2000)** — Voronoi-based dominant regions.
- **Friends of Tracking** video/code series (David Sumpter, Laurie Shaw).

---

## 9. ATTRIBUTES FOR A FOOTBALL MANAGER GAME

I recommend a **1–20 integer scale** (Football Manager convention) per attribute, with role-conditional weighting.

### 9.1 Technical
`passing, first_touch, dribbling, finishing, crossing, long_shot, heading, free_kick, penalty, technique, long_throw, corners, tackling, marking`

### 9.2 Mental
`positioning, decisions, vision, anticipation, composure, off_ball, work_rate, aggression, bravery, leadership, concentration, determination, teamwork, flair, pressure_resistance`

### 9.3 Physical
`pace, acceleration, stamina, strength, agility, jumping_reach, balance, natural_fitness, recovery`

### 9.4 Goalkeeper-Specific
`reflexes, one_on_ones, aerial_reach, command_of_area, throwing, kicking, gk_first_touch, gk_passing, rushing_out, eccentricity, handling`

### 9.5 Hidden / Trait Flags (boolean or 0–3 intensity)
*FM-style preferred-move modifiers* — these are the layer that brings a player to life:

- `plays_one_twos` (chooses give-and-go vs other options)
- `tries_killer_balls_often` (raises through-ball frequency)
- `tries_long_shots` (raises long-shot frequency)
- `stays_back_at_all_times` / `gets_forward_whenever_possible`
- `comes_deep_to_get_ball` (false-9 / regista trait)
- `moves_into_channels` (striker drift)
- `gets_into_opposition_area` (late-runner #8)
- `cuts_inside_from_wing` (inverted winger trigger)
- `runs_with_ball_often / rarely`
- `places_shots / shoots_with_power`
- `does_not_dive_into_tackles`
- `marks_opponent_tightly`
- `plays_with_back_to_goal` (target-man trait)
- `dictates_tempo`
- `arrives_late_in_box` (raumdeuter)

### 9.6 Role-Weighted Effective Attribute
For role $R$, the effective attribute of player $p$ for skill $s$ is:
$$A^{R}_{s}(p) = w^R_s \cdot A_s(p)$$

with $\sum w^R_s$ per role normalised (Pep-style inverted FB heavily weights `passing, vision, positioning, technique, decisions`; a traditional wing-back weights `pace, stamina, crossing, work_rate`).

Build a JSON-style role descriptor:
```
{ "inverted_fullback": {
    "passing":1.5,"vision":1.4,"positioning":1.3,"technique":1.3,
    "stamina":0.9,"crossing":0.4,"pace":0.9,"marking":1.0 } }
```

---

## 10. MATCHUP MATHEMATICS — CONCRETE ENGINE FORMULAS

All formulas use attributes on 1–20 with mean ≈ 10. Tune via simulation.

### 10.1 Generic Duel Outcome
For a contested 1v1 action (attacker $A$ vs defender $D$):
$$P(A \text{ wins}) = \sigma\!\left(\frac{Q_A - Q_D + \text{Tactical Mod} + \epsilon}{T}\right)$$

where $\sigma$ is the logistic function, $T \approx 5$ is a temperature (controls determinism), $\epsilon \sim \mathcal{N}(0, 1)$ is randomness, and $Q$ is a role-weighted quality score.

### 10.2 Winger vs Full-back 1v1 (Dribble Attempt)
$$Q_A = 0.35 \cdot \text{dribbling} + 0.25 \cdot \text{pace} + 0.15 \cdot \text{acceleration} + 0.10 \cdot \text{technique} + 0.10 \cdot \text{flair} + 0.05 \cdot \text{balance}$$

$$Q_D = 0.30 \cdot \text{tackling} + 0.20 \cdot \text{pace} + 0.15 \cdot \text{positioning} + 0.15 \cdot \text{marking} + 0.10 \cdot \text{anticipation} + 0.10 \cdot \text{strength}$$

Modifier examples:
- If defender's pace is at least 4 less than attacker's: $+2$ to $Q_A$.
- If `cuts_inside_from_wing` and defender's strong side faces inside: $+1$ to $Q_A$.

### 10.3 Aerial Duel Probability
$$P(A \text{ wins aerial}) = \sigma\!\left(\frac{(h_A + j_A + s_A) - (h_D + j_D + s_D)}{15}\right)$$

with $h$ = heading, $j$ = jumping reach, $s$ = strength × 0.5.

### 10.4 Press Success Probability (per pressing event)
For a presser $P$ vs ball-carrier $B$ within $\le$ 3 m:
$$P(\text{turnover}) = \sigma\!\left(\frac{(WR_P + Agg_P + Anti_P) - (FT_B + Comp_B + Tech_B) + \text{Block Compactness}}{10}\right)$$

`Block Compactness` ∈ {-2 (sparse), 0, +2 (tight)} based on average distance between team-mates.

### 10.5 Shot xG (Engine Form)
Closed-form approximation usable per shot:
$$xG = \sigma\!\left(-3.2 + 0.10 \cdot \text{angle}_\text{deg} - 0.07 \cdot \text{distance}_\text{m} - 0.40 \cdot D_\text{cover} + 0.20 \cdot \text{Finishing}_z + 0.15 \cdot \text{Composure}_z\right)$$

where $D_\text{cover}$ = number of defenders between ball and goal, and $X_z = (X - 10)/3$ is standardised.

### 10.6 Pass Completion (Press-Resistance)
$$P(\text{pass completes}) = \sigma\!\left(\frac{\text{Pass}_p + \text{Tech}_p \cdot \mathbb{1}_\text{press} - \text{Pressure} - \text{Distance Penalty}}{6}\right)$$

### 10.7 xG Chain Build-up
For a possession sequence ending in xG $g$, distribute credit to players in the chain:
$$\text{share}_i = \frac{w_i \cdot \alpha_i}{\sum_j w_j \cdot \alpha_j} \cdot g$$

where $\alpha_i \in \{$0.4 (shot), 0.3 (key pass), 0.15 (progressive carry), 0.10 (line-breaking pass), 0.05 (early build-up)$\}$ and $w_i$ is a small attribute-quality weighting.

### 10.8 Formation Matchup Multiplier
Define a 6×6 lookup matrix $M_{form_A, form_B}$ from §2 above. Zone control in each pitch zone gets multiplied:
$$\text{ZoneControl}_z \leftarrow \text{ZoneControl}_z \cdot M_{form_A, form_B, z}$$

Example: 3-5-2 vs 4-4-2 → midfield zones get ×1.15 to the 3-5-2 side; wide zones get ×0.95 (wing-backs vs wingers neutral); back zone ×1.10 (free CB).

### 10.9 Fatigue Effect on Attributes
For player at fitness $F \in [0,1]$ (1.0 = fresh):
$$A^{eff}_s = A_s \cdot \left[1 - k_s (1 - F)\right]$$

with $k_s$ skill-dependent: physical attributes have $k \approx 0.4$ (pace decays heavily), mental $k \approx 0.10$, technical $k \approx 0.20$.

Fitness decays per minute as:
$$\Delta F = -\frac{c}{Stamina + NaturalFitness} \cdot \text{intensity}$$

`intensity` ∈ {0.6 (low-block), 1.0 (normal), 1.4 (gegenpress)}.

### 10.10 Morale & Form
$$A^{eff'}_s = A^{eff}_s \cdot (1 + \mu \cdot \text{Morale}_z + \phi \cdot \text{Form}_z)$$

with $\mu, \phi$ small (≈ 0.03–0.05), morale and form standardised. Composure, decisions, and finishing are most affected; pace and jumping reach are not.

### 10.11 Tactical Familiarity Multiplier
For player $p$ in tactic $T$, familiarity $F_T \in [0,1]$:
$$A^{eff''}_s = A^{eff'}_s \cdot (0.85 + 0.15 F_T)$$

A player using an unfamiliar tactic plays at ~85% of their attribute level. Familiarity is gained via training time and matches in that system. Drives the "pre-season ramp-up" feel.

### 10.12 Team Tactical Synergy
Compute a synergy score:
$$\Sigma_\text{team} = \frac{1}{|S|}\sum_{(i,j) \in S} \frac{1}{1 + d(role_i, role_j)}$$

with $d$ = role-compatibility distance (e.g., inverted-FB + #6 pair has low $d$; overlapping-FB + inverted-winger has low $d$ on same side). Synergy boosts zone control multiplicatively (1.0 + 0.10·$\Sigma$).

### 10.13 Counter-Attack Trigger
On ball recovery in zone $z$, fire counter if:
$$\text{Counter} = \mathbb{1}\!\left[\frac{N_\text{attackers ahead of ball}}{N_\text{defenders ahead of ball} + 1} > \tau \;\wedge\; \text{pace}_\text{leading runner} > 14 \;\wedge\; \text{vertical pass available}\right]$$

with $\tau \approx 0.8$.

### 10.14 Rest-Defense Quality
$$RD = \alpha (N_\text{defenders behind ball} - N_\text{opp runners ahead}) + \beta \cdot \text{pace}_\text{slowest defender}$$

Negative $RD$ → vulnerable to counter; engine flags opp counter xG +25% if $RD < 0$.

### 10.15 Pitch Control (Engine-Cheap Approximation)
Instead of Spearman PPCF every tick, approximate per pitch cell $z$:
$$C_z^A = \frac{\sum_{i \in A} \exp(-\lambda \tau_{i,z})}{\sum_{i \in A} \exp(-\lambda \tau_{i,z}) + \sum_{j \in B} \exp(-\lambda \tau_{j,z})}$$

where $\tau_{i,z} = \frac{\|\mathbf{x}_i - z\|}{\text{pace}_i / 5}$ and $\lambda \approx 1.5$. Cheap, smooth, and visually correct.

---

## CLOSING NOTES FOR ELIFOOT DESIGN

For a **SNES-style story-mode manager game**, the engine does not need to simulate continuous tracking data, but borrowing the *concepts* yields enormous gameplay depth:

1. Model the pitch as a **5-lane × 6-zone (30-cell) grid** — enough to express half-spaces, build-up phases, and the final third without overwhelming the SNES aesthetic.
2. Each tactic the manager sets defines a **target shape per phase** (build-up, mid-build, attack, defensive transition, defensive shape). The engine resolves matchups zone-by-zone using the formulas above.
3. Implement the **Five Superiorities** as visible UI feedback (e.g., "We have a numerical advantage on the left half-space! +15%") — perfect for an educational story mode that teaches tactics.
4. Hidden traits (FM-style preferred moves) are *the* mechanism that makes signings feel different. A regen with `cuts_inside_from_wing` + `tries_killer_balls_often` plays like a young Mahrez even if his numbers look ordinary.
5. The **manager identity** in the story mode could be modelled on the historical axis: a Sacchian, a Mourinhist, a positional-play disciple, a Bielsista, a De Zerbi-ist — each with their own training menus, signing preferences, and tactical instructions, granting Familiarity bonuses to compatible players.
6. The match engine's stochastic core should be Bernoulli-trial duels resolved by the logistic formulas, with state transitions across the 30-zone grid driven by an xT-like value function — this is computationally trivial, deterministic enough to feel coherent, and tactical enough to reward player learning.

This is the bridge from real football science to a deep, playable, story-driven manager experience.