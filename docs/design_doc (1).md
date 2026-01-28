# Agent 時代組織運行方式設計文稿

---

## 一、核心定位

**目標用戶**：Companies deploying 10+ autonomous agents who need velocity but can't accept chaos.

**我們不是**：
- Not an approval system
- Not an AI safety firewall
- Not a rollback engine
- Not a centralized agent controller

**我們是什麼**：不再是 agent control plane 的一個版本，而是一種對 agent 時代組織運行方式的定義。我們不是賣能力，而是賣人類能否及時接管。

**對外表述**：
- ✅ "We help humans coordinate at agent speed"
- ✅ "Datadog tells you what happened. Rubrik lets you undo it. We help you prevent it, recover faster, and make sure it never happens again."
- ❌ "We do LLM observability"（撞 Datadog/Arize/Traceloop）
- ❌ "We rewind agent mistakes"（撞 Rubrik）

---

## 二、為什麼不做事前中心化防治

事前中心化的防治（centralized pre-execution interception）是不對的：

1. **事前治理會讓 authorization 成為瓶頸**：如果每次 agent 行動都需要人工審批，就輸了。這是一個減速器。哪怕它宣稱能加速，只要核心邏輯是 ask human before execute，它就不可能成為加速器。

2. **真正的控制不應該是防禦系統，而是加速器**：阻斷不等於安全，預設去問人類是不對的。

3. **最大的幻覺**：如果系統足夠複雜、足夠聰明、足夠全面，就可以在事前防止大部分錯誤。

4. **沒有執行就沒有數據，沒有數據就不可能進步**。

5. **最危險的錯誤是事前無法識別的**：事前的 approval 只能擋住明顯不該做的事情。

6. **審批只是人類介入的一種形式，而不是治理的核心形態**：不是移除所有審批，而是要按行為類型分級提供介入能力。

**結論**：我們應該放棄系統代替人類判斷的幻覺，構建一個讓人類判斷跟得上 agent 速度的系統。

---

## 三、治理的重新定義

**我不是反對實時治理，是治理應該被去中心化。**

一個中央決策系統會有上面所有的問題。

- 治理不應該是一個判斷 approval or reject 的判斷器，而是嵌在每一個 intervention point。
- 治理不再是要不要做，而是做了之後我怎麼介入。
- 治理不是阻斷行為，而是縮短人類介入的反應時間。
- 控制不應該被做成中心，控制應該是系統在每個 intervention point 提供介入能力。
- 這不是一個 plane，而是一張實時協作網絡。控制也不再是一個中心，而是一種組織運行方式。

---

## 四、關於 Recovery 和 Rollback 的觀點

### 快速恢復的正確理解

快速恢復作為一個結果是正確的，但是把快速恢復做成功能是不對的。特別是把快速恢復做成完美回滾。

- **回滾永遠是臨時性的**。
- **我們應該承認很多行為都是 irreversible**：不可逆不是完全不能撤銷，而是因為撤銷成本、權限、極短的窗口期以及不可驗證性導致我們說它是不可逆的。
- **Recovery 的速度是無法被保證的**，這取決於動作類型。我們只能保證會提供最快的可能恢復路徑（fastest possible action type）給每個動作類型（action type）。
- **可逆性和回滾不應該是主敘事**，而是恢復路徑裡的一種可能性。

### 真正的「快」是什麼

真正的快不是回滾恢復的快，是意識到錯誤的快，是介入的快，不是犯錯的少。真實世界需要的是可插手的速度。而且在真正開發的時候不是需要回滾，而是不知道是誰幹的，應該快速定位。

### Rollback 的本質

**我的觀點：回滾不是一個技術能力，而是社會能力。**

- Rollback 不是 checkpoint。
- Rollback 的核心資源不是 storage，而是誰知道怎麼補救 + 誰願意補救。
- 把 rollback 變成 deterministic system capability 是錯誤的。現實是 human coordination capability。
- 幾乎所有真正的大事故都不是沒人能修，而是不知道找誰、從哪一步開始。

---

## 五、真實痛點與真實需求

### 三大痛點
1. 不知道誰幹的
2. 不知道為什麼又犯了
3. 不知道現在系統處在哪個版本

### 真正的風險
不是太多破壞，而是看不見的破壞。破壞發生了，但沒人看見。

### 真實需求
可見性、快速定位、快速學習、同步溝通。

- 把所有變化可見
- 每個變化都能被追蹤
- 每個影響都能歸因到人或 agent
- 出問題時立刻知道找誰

這比任何安全模型都更接近真實的生產事故。

### 比預防更重要的是
- 立刻知道發生了什麼
- 是否能準確知道是誰/哪個 action 導致的
- 是否能立刻止血
- 是否能用最快路徑恢復

### 關於學習
我們會學習事故，並且阻止重複。因為犯錯不可怕，可怕的是犯同樣的錯。

---

## 六、設計原則

### 採用的流程
執行 → 廣播 → 可見 → 介入 → 恢復 → 學習

### 默認策略
monitored_executed

### 五個閉環要素
1. **發生了什麼**（action/effect）
2. **誰幹的、影響到誰**（Ownership / Attribution）
3. **我現在能不能插手**（Intervention / Routing）
4. **已經出事了怎麼辦**（Containment / Recovery）
5. **下次怎麼不再盲目**（Postmortem / Governance evolution）

### 注意
時間相關 ≠ 因果，這是假歸因。

---

## 七、競爭對手分析

### Rubrik

**背景**：2025 年 8 月發布 Agent Rewind，10 月發布完整的 Agent Cloud 平台。宣稱提供 "the industry's only solution for precise time and blast radius rollback of undesirable or destructive actions"，能夠 "instantly undo unwanted or destructive actions, without any downtime or data loss"。

**Rubrik 的設計哲學**：
1. 來自 data backup 背景：Rubrik 是做企業備份/災難恢復起家的，Agent Cloud 是把這套邏輯套用到 AI agent
2. 依賴 Rubrik Security Cloud：Agent Rewind 需要和他們的 backup infrastructure 整合
3. 面向大企業：Microsoft Copilot Studio、Salesforce Agentforce、Amazon Bedrock
4. Rollback = 還原數據快照：他們的 "rewind" 本質上是還原被 agent 修改的 files/databases/configurations
5. No learning loop：Rewind 後不會學習如何防止重複發生

**Rubrik 的邏輯**：agent 搞砸 → 還原數據快照

### Datadog

**背景**：2025 年 6 月 DASH 大會發布 AI Agent Monitoring、LLM Experiments 和 AI Agents Console，提供 "end-to-end visibility, rigorous testing capabilities, and centralized governance of both in-house and third-party AI agents"。

**局限**：他們的 "governance" 是可見性治理（看到 agents 有什麼 permissions），不是執行治理（控制 agent 能做什麼）。他們沒有 action routing、沒有 rollback、沒有 incident response。

### 市場現狀

市場上所有人都在做 Trace/replay。但這些永遠只能是背景設施，而不是產品本身。Replay 只是一個地基，因為所有行為都依賴完整事件鏈。

---

## 八、我們與競爭對手的本質差異

**我和市場所有的控制產品有本質差異。為了避免做成減速器，他們都是事後分析。而我做到的是事前 routing + 事中 monitoring + 事後 recovery。**

| 維度 | Rubrik | Datadog | 我們 |
|------|--------|---------|------|
| DNA | 企業備份、災難恢復 | 可觀測性 | 開發者工作流協調 |
| 回滾方式 | 數據快照還原 | 無 | 多策略（包括 git revert、DB rollback 等） |
| Pre-action routing | 無 | 無 | Rule-based router |
| Blast radius | 只顯示 dependency graph | - | 主動通知 affected owners |
| Learning loop | 無 | 無 | Postmortem + pattern detection |
| Target | 企業 Salesforce、Copilot Studio | - | Dev teams |

### 核心差異點
1. **Pre-action routing**：他們都是事後反應，但我在不影響不阻止事件發生的情況下就進行分流，通過不同的路徑，比如給一些行為打上 monitored_executed 的標籤
2. **Operational coordination**：能解決 who should know 的問題，他們不能
3. **Learning loop**：postmortem + pattern detection 是閉環設計
4. **多種策略的恢復**：他們只能還原數據

### 執行邏輯對比
- **Rubrik**：action 執行 → 出事 → rewind
- **我們**：action 進來 → routing 決策 → monitored execution → 出事時快速 recover → 學習防止重複
- **另一種表述**：action 執行（帶 monitoring）→ 如果出事，更快發現 → 更快 recover

Rubrik 是「滅火器」，我們是「消防系統 + 滅火器 + 防火訓練」。

---

## 九、市場意義

市場驗證了問題存在：Rubrik 能拿到 funding 做這個，Datadog 能在 DASH 大會發布 AI Agents Console，說明市場承認這個問題是真的。我們不需要再教育市場「agent governance 重要」——大公司已經在幫我們做這件事了。

---

## 十、對外溝通原則

1. **不要再說 "visibility + recovery"**：這會讓我聽起來像 Rubrik 的窮人版

2. **強調真正差異點**：
   - Pre-action routing（Rubrik 完全沒有）
   - TTI (Time-to-Intervention)（人類跟上 agent 速度的核心指標）
   - Learning loop（防止重複發生）

3. **我的出發點是人類如何跟得上 agent 的速度**
