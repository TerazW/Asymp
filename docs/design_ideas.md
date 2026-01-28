不是阻止錯誤，而是快速恢復。但快速恢復作爲一個結果是正確的，但是把快速恢復做成功能是不對的。特別是把快速恢復做成完美回滾。回滾永遠是臨時性的。我們應該承認很多行爲都是irreversible。不可逆不是完全不能撤銷，而是因爲撤銷成本、權限、和極短的窗口期以及不可驗證性導致我們説他是不可逆的。Recovery的速度是無法被保證的，這取決於動作類型。我們只能保證會提供最快的可能恢復路徑( fastest possible action type)給每個動作類型(action type)。所以可逆性和回滾不應該是主敘事，而是恢復路徑裏的一種可能性。真正的快不是回滾恢復的快，是意識到錯誤的快，是介入的快，不是犯錯的少。真實世界需要的是可插手的速度。而且在真正開發的時候不是需要回滾，而是不知道是誰幹的，應該快速定位。
我們會學習事故，并且阻止重複。因爲犯錯不可怕，可怕的是犯同樣的錯。不是太多破壞，而是看不見的破壞。所以真實需求是可見性，快速定位，快速學習，同步溝通。把所有變化可見，每個變化都能被追蹤，每個影響都能歸因到人或agent，出問題時立刻知道找誰。這比任何安全模型都更接近真實的生產事故。
目標用戶：companies deploying 10+ autonomous agents who need velocity but can’t accept chaos.我們不是賣能力，而是賣人類能否及時接管。不再是agent control plane的一個版本，而是一種對agent時代組織運行方式的定義。- Not an approval system Not an AI safety firewall Not a rollback engine Not a centralized agent controller

事前中心化的防治（centralized pre-execution interception）是不對的，因爲事前治理會讓authorization成爲瓶頸。如果每次agent行動都需要人工審批，就輸了。這是一個減速器。哪怕它宣稱能加速，只要核心邏輯是ask human before execute，它就不可能成爲加速器。而真正的控制不應該是防禦系統，而是加速器。因爲阻斷不等於安全，預設去問人類是不對的。這是最大的幻覺：如果系統足夠複雜，足夠聰明，足夠全面，就可以在事前防止大部分錯誤。而且沒有執行就沒有數據，沒有數據就不可能進步。審批只是人類介入的一種形式，而不是治理的核心形態。不是移除所有審批，而是要按行爲類型分級提供介入能力。所以比預防更重要的是立刻知道發生了什麽，是否能準確知道是誰/哪個action導致的。是否能立刻止血。是否能用最快路徑恢復。
而且最危險的錯誤是事前無法識別的。事前的approval只能擋住明顯不該做的事情。。我們應該放棄系統代替人類判斷的幻覺，構建一個讓人類判斷跟得上agent速度的系統。所以控制不應該被做成中心，控制應該是系統在每個intervention point提供介入能力。這不是一個plane，而是一張實時協作網絡。控制也不再是一個中心，而是一種組織運行方式。這是我對agent時代組織運行方式的定義。我不是反對實時治理，是治理應該被去中心化。一個中央決策系統會有上面所有的問題。治理不應該是一個判斷approval or reject的判斷器，而是嵌在滅一個intervention point。治理也不再是要不要做，而是做了之後我怎麽介入。治理不是阻斷行爲，而是縮短人類介入的反應時間。
我的觀點：回滾不是一個技術能力，而是社會能力。Roll back不是checkpoint。Rollback的核心資源不是storage。而是誰知道怎麽補救+誰愿意補救。把rollback變成deterministic system capability是錯誤的。現實是human coordination capability。
三大痛點是：不知道誰幹的，不知道爲什麽又犯了，不知道現在系統處在哪個版本。幾乎所有真正的大事故都不是沒人能修，而是不知道找誰，從哪一步開始。真正的風險是：破壞發生了，但沒人看見。
市場上所有人都在做Trace/replay。但這些永遠只能是背景設施，而不是產品本身。Replay只是一個地基。因爲所有行爲都依賴完整事件鏈。•  event chain 是系统存在的前提，不是产品差异
•  token tracking / finops / usage analytics → feature，不是 company.只做trace + finops 公司，切在了错误的 abstraction layer
YC funded a trace company last year.
That made sense — trace was the first missing layer.
But once trace becomes default, teams still don’t know who should act, or how fast they can intervene.
That’s where companies stall.”


我們采用的是执行 → 广播 → 可见 → 介入 → 恢复 → 学习。我們的默認策略應該是monitored_executed。
時間相關≠ 因果，这是假归因。
五個閉環要素是發生了什麽（action/effect）谁干的、影响到谁（Ownership / Attribution）我现在能不能插手（Intervention / Routing）已经出事了怎么办（Containment / Recovery）下次怎么不再盲目（Postmortem / Governance evolution）。

競爭對手：
Rubrik 在 2025 年 8 月發布了 Agent Rewind，10 月發布了完整的 Agent Cloud 平台。他們宣稱提供 "the industry's only solution for precise time and blast radius rollback of undesirable or destructive actions"，能夠 "instantly undo unwanted or destructive actions, without any downtime or data loss"
Rubrik 的設計哲學
1.	來自 data backup 背景：Rubrik 是做企業備份/災難恢復起家的，Agent Cloud 是把這套邏輯套用到 AI agent
2.	依賴 Rubrik Security Cloud：Agent Rewind 需要和他們的 backup infrastructure 整合
3.	面向大企業：Microsoft Copilot Studio、Salesforce Agentforce、Amazon Bedrock
4.	Rollback = 還原數據快照：他們的 "rewind" 本質上是還原被 agent 修改的 files/databases/configurations
5.	No learning loop：Rewind 後不會學習如何防止重複發生

聽起來和我很像，但他們和我的設計哲學有本質上的不同。他的DNA是企業備份，災難恢復。而我們能實現的是開發者工作流協調。他們回滾方式是數據快照還原，我們是多策略（包括git revert，DB rollback）等等。他們沒有pre_action routing。而我做了rule-based router.他們的blast radius是顯示什麽被改了。只顯示 dependency graph。而我是主動通知affected owners。他們沒有learning loop，而我有postmortem + pattern detection。他們的target是企業salesforce，copilot studio，而我面向dev teams。

Datadog 的最新動態
Datadog 在 2025 年 6 月 DASH 大會發布了 AI Agent Monitoring、LLM Experiments 和 AI Agents Console，提供 "end-to-end visibility, rigorous testing capabilities, and centralized governance of both in-house and third-party AI agents"。 DatadogDatadog
但他們的 "governance" 是可見性治理（看到 agents 有什麼 permissions），不是執行治理（控制 agent 能做什麼）。他們沒有 action routing、沒有 rollback、沒有 incident response。
我和市場所有的控制產品有本質差異。爲了避免做成減速器，他們都是事後分析。而我做到的是事前 routing + 事中 monitoring + 事後 recovery。我與市場上所有玩家的核心差異是：pre-action routing – 他們都是事後反應，但我在不影響不阻止事件發生的情況下就進行分流，通過不同的路徑，比如給一些行爲打上monitored_executed的標簽。我能解決operational coordination，也就是who should know的問題。他們不能。我的learning loop – postmortem + pattern detection是閉環設計。他們只能還原數據，我有多種策略的恢復。"Datadog tells you what happened. Rubrik lets you undo it. We help you prevent it, recover faster, and make sure it never happens again."

Rubrik 的邏輯是：agent 搞砸 → 還原數據快照
你的邏輯是：action 進來 → routing 決策 → monitored execution → 出事時快速 recover → 學習防止重複
這是完全不同的設計哲學。Rubrik 是「滅火器」，你是「消防系統 + 滅火器 + 防火訓練」。

你不是在做什么？
•	❌ 不是“禁止起火”（pre-approval）
•	❌ 不是“中央调度消防总指挥部”（central control plane）
•	❌ 不是“完美防火”（zero-incident fantasy）
🚒 你在做什么？
•	✅ 默认火会发生
•	✅ 让火变得可发现
•	✅ 让正确的人能第一时间介入
•	✅ 把损失限制在局部
•	✅ 通过训练和复盘，让下次反应更快


市場驗證了問題存在
Rubrik 能拿到 funding 做這個，Datadog 能在 DASH 大會發布 AI Agents Console，說明市場承認這個問題是真的。你不需要再教育市場「agent governance 重要」——大公司已經在幫你做這件事了

我對外：
1. 不要再說 "visibility + recovery"
這會讓我聽起來像 Rubrik 的窮人版。
2. 強調我的真正差異點
•	Pre-action routing（Rubrik 完全沒有）
•	TTI (Time-to-Intervention)（人類跟上 agent 速度的核心指標）
•	Learning loop（防止重複發生）
我的出發點是人類如何跟得上agent的速度。

不應該說的
•	❌ "We do LLM observability" (撞 Datadog/Arize/Traceloop)
•	❌ "We rewind agent mistakes" (撞 Rubrik)
我應該說的
"We help humans coordinate at agent speed"
或者更具體：
"Datadog tells you what happened. Rubrik lets you undo it. We help you prevent it, recover faster, and make sure it never happens again."

•  Rubrik：action 執行 → 出事 → rewind 
•  你：action 執行（帶 monitoring）→ 如果出事，更快發現 → 更快 recover
