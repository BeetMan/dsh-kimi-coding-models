window.__ModuleLoader__.load({
  id: 'dsh-kimi-coding-models',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'settings.kimi-coding-models'
    const ENTRY = 'kimi-coding-models'
    const MAX_SYNC_INTERVAL_MINUTES = 10080
    const DEFAULTS = {
      endpoint: 'https://api.kimi.com/coding/v1/models',
      baseURL: 'https://api.kimi.com/coding/v1',
      usageEndpoint: 'https://api.kimi.com/coding/v1/usages',
      apiKeyEnv: 'KIMI_CODING_API_KEY',
      defaultMaxTokens: 131072,
      syncOnStart: false,
      syncIntervalMinutes: 0,
      platform: 'china',      showChatQuota: true,
      chatQuotaStyle: 'badge',
      chatQuotaBorder: true,
    }
    const PREVIEW_QUOTA = {
      rolling: { usedPercent: 18 },
      weekly: { usedPercent: 32 },
    }
    const PLATFORMS = {
      china: {
        endpoint: 'https://api.kimi.com/coding/v1/models',
        usageEndpoint: 'https://api.kimi.com/coding/v1/usages',
        baseURL: 'https://api.kimi.com/coding/v1',
      },
      global: {
        endpoint: 'https://api.kimi.ai/coding/v1/models',
        usageEndpoint: 'https://api.kimi.ai/coding/v1/usages',
        baseURL: 'https://api.kimi.ai/coding/v1',
      },
    }

    const en = {
      nav: 'Kimi Coding',
      title: 'Kimi Coding models',
      description: 'Check the live Kimi Coding catalog and add newly published models to this profile.',
      check: 'Check for updates',
      checking: 'Checking…',
      sync: 'Sync models now',
      confirmSync: 'Confirm full sync',
      syncWarning: 'Sync replaces the route model list with the live catalog. Models no longer published will be removed.',
      removalWarning: 'This sync will also remove the models listed below. Select Confirm full sync to proceed.',
      confirmationStale: 'The catalog or route changed since this check. Review the latest result and confirm again before anything is written.',
      syncing: 'Syncing…',
      checkFirst: 'Check the live catalog to see which models this profile is missing. Nothing is written until you sync.',
      upToDate: 'This profile already serves every published model.',
      updateAvailable: 'The live catalog differs from this profile. Review the changes before syncing.',
      synced: 'Model catalog synchronized. The new models are now selectable.',
      models: 'Published models',
      available: 'Available',
      missing: 'Not served',
      added: 'Added',
      removed: 'No longer published',
      checkedAt: 'Checked',
      quota: 'Subscription quota',
      modelCaps: 'Model limits',
      modelCapsHint: 'Set the context window (maximum input) and output cap for each model in this profile\'s kimi-coding route. Leave a field empty to inherit the installed pi-ai catalog value (the placeholder shows the pi-ai 1.6.0 limit where known). Saving writes the route immediately; model synchronization keeps these limits.',
      modelCapsEmpty: 'This profile has no kimi-coding models yet. Check for updates and sync the live catalog first.',
      modelCapsPlaceholder: 'inherit',
      contextWindow: 'Context window (max input)',
      maxOutput: 'Max output tokens',
      saveCaps: 'Save model limits',
      savingCaps: 'Saving…',
      capsSaved: 'Model limits saved.',
      capsReload: 'Reload',
      capsInvalid: 'Enter a positive whole number, or leave the field empty.',
      pinModel: 'Pin: keep this model when synchronizing, even if the catalog drops it.',
      unpinModel: 'Unpin: let synchronization remove this model when the catalog drops it.',
      pinnedBadge: 'Pinned',
      pinnedKept: 'Pinned, kept although no longer published',
      exhaustionIn: 'At this pace, full in ~{h}h',
      quotaHint: 'Read the current 5-hour rolling window and 7-day subscription quota.',
      refreshQuota: 'Refresh quota',
      refreshingQuota: 'Reading quota…',
      quotaFirst: 'Reading the latest subscription usage…',
      rollingQuota: '5-hour rolling window',
      weeklyQuota: '7-day quota',
      used: 'used',
      remaining: 'remaining',
      resetsAt: 'Resets',
      resetSoon: 'resetting now',
      resetInPrefix: 'in ',
      resetInSuffix: '',
      durationJoin: ' ',
      durationDay: 'd',
      durationHour: 'h',
      durationMinute: 'm',
      membership: 'Membership',
      usageEndpoint: 'Quota endpoint',
      usageEndpointHint: 'Endpoint returning Kimi Coding subscription usage.',
      settings: 'Synchronization settings',
      settingsHint: 'Changes are saved to this DSH profile.',
      platform: 'Platform',
      platformHint: 'Fills the three endpoint fields below with the preset for the chosen Kimi Code platform. A mix of official and custom addresses shows as Custom. If the profile route declares its own base URL, update that row to the same host; the two platforms issue different API keys.',
      platform_china: 'China (api.kimi.com)',
      platform_global: 'Overseas (api.kimi.ai)',
      platform_custom: 'Custom (mixed endpoints)',
      endpoint: 'Catalog endpoint',
      endpointHint: 'Endpoint returning the OpenAI-compatible model list.',
      baseURL: 'Route base URL',
      baseURLHint: 'Used only when the kimi-coding route does not already declare one.',
      apiKeyEnv: 'Credential reference',
      apiKeyEnvHint: 'Environment-variable name only. Never paste the API key here.',
      defaultMaxTokens: 'Default output tokens',
      defaultMaxTokensHint: 'Fallback for a newly discovered model whose family and listing disclose no output cap. Known Kimi Coding models use the pi-ai 1.6.0 limits.',
      syncOnStart: 'Sync when DSH starts',
      syncOnStartHint: 'Runs once in the background on the next plugin activation.',
      syncIntervalMinutes: 'Interval sync (minutes)',
      syncIntervalMinutesHint: 'Runs one background sync per interval while DSH is running. 0 disables it; 1–10080 minutes, up to one week.',
      showChatQuota: 'Show quota in the chat window',
      showChatQuotaHint: 'Shows a compact quota pill while the conversation uses Kimi Coding. Refreshes every minute when visible.',
      chatQuotaBorder: 'Chat quota border',
      chatQuotaBorderHint: 'Draws the bordered pill around the chat quota indicator. Plain text always stays borderless.',
      chatRollingShort: '5h',
      chatWeeklyShort: '7d',
      chatLoading: '…',
      chatUnavailable: 'Quota unavailable',
      quotaTimeout: 'Quota request timed out. Try refreshing again.',
      chatQuotaStyle: 'Chat quota style',
      chatQuotaStyleHint: 'Choose the appearance of the quota indicator in the chat input.',
      chatQuotaStyle_badge: 'Badge (default)',
      chatQuotaStyle_plain: 'Plain text',
      chatQuotaStyle_bars: 'Dual progress bars',
      chatQuotaStyle_ring: 'Progress ring',
      chatQuotaStyle_bar: 'Single progress bar',
      chatQuotaStyle_dot: 'Status dot',
      stylePreview: 'Preview',
      save: 'Save settings',
      saving: 'Saving…',
      discard: 'Discard changes',
      saved: 'Settings saved.',
      saveRejected: 'The profile refused this change. Reload the page and try again.',
      saveConflict: 'Settings changed elsewhere. Review your draft, then save again to overwrite these fields, or discard it.',
      staleResult: 'The previous result is retained and may be out of date.',
      loading: 'Loading settings…',
      unavailable: 'Settings are unavailable in this profile.',
      readOnly: 'This profile is read-only; settings cannot be changed here.',
      overridden: 'Customized',
      invalidUrl: 'Use HTTPS, or HTTP with a loopback address.',
      invalidCredentialRef: 'Use an environment-variable name such as KIMI_CODING_API_KEY.',
      invalidTokens: 'Enter a positive whole number.',
      invalidInterval: 'Enter 0 to disable, or a whole number of minutes between 1 and 10080.',
      operationFailed: 'The operation failed',
    }
    const zh = {
      nav: 'Kimi Coding',
      title: 'Kimi Coding 模型',
      description: '检查 Kimi Coding 在线目录，把新发布的模型加入当前 profile。',
      check: '检查更新',
      checking: '正在检查…',
      sync: '立即同步模型',
      confirmSync: '确认完整同步',
      syncWarning: '同步会用线上目录替换路由模型列表，线上已下架的模型将被移除。',
      removalWarning: '本次同步还会移除下列模型。确认后继续，请点击“确认完整同步”。',
      confirmationStale: '检查后模型目录或路由已变化。请查看最新结果并重新确认；此次没有写入任何配置。',
      syncing: '正在同步…',
      checkFirst: '点击“检查更新”查看当前缺少哪些模型。只有点击同步后才会写入配置。',
      upToDate: '当前 profile 已提供全部线上模型。',
      updateAvailable: '线上目录与当前 profile 存在差异，请检查后再同步。',
      synced: '模型目录已同步，新模型现在可以选择。',
      models: '线上模型',
      available: '已提供',
      missing: '未提供',
      added: '本次新增',
      removed: '线上已下架',
      checkedAt: '检查时间',
      quota: '订阅额度',
      modelCaps: '每个模型的限制',
      modelCapsHint: '为当前 profile 的 kimi-coding 路由中的每个模型设置上下文窗口（最大输入）和输出上限。留空表示沿用当前安装的 pi-ai 目录值（占位符显示已知的 pi-ai 1.6.0 限制）。保存后立即写入路由，后续同步会保留这些限制。',
      modelCapsEmpty: '当前 profile 还没有 kimi-coding 模型，请先“检查更新”并同步线上目录。',
      modelCapsPlaceholder: '沿用',
      contextWindow: '上下文窗口（最大输入）',
      maxOutput: '最大输出 Token',
      saveCaps: '保存模型限制',
      savingCaps: '正在保存…',
      capsSaved: '模型限制已保存。',
      capsReload: '重新读取',
      capsInvalid: '请输入正整数，或留空。',
      pinModel: '锁定：同步时保留此模型，即使线上目录已下架。',
      unpinModel: '解锁：同步时若线上目录已下架则移除此模型。',
      pinnedBadge: '已锁定',
      pinnedKept: '已锁定保留（线上已下架）',
      exhaustionIn: '按当前速率约 {h} 小时后用尽',
      quotaHint: '读取当前 5 小时滚动窗口和 7 天订阅额度。',
      refreshQuota: '刷新额度',
      refreshingQuota: '正在读取额度…',
      quotaFirst: '正在读取最新订阅用量…',
      rollingQuota: '5 小时滚动窗口',
      weeklyQuota: '7 天额度',
      used: '已用',
      remaining: '剩余',
      resetsAt: '重置时间',
      resetSoon: '即将重置',
      resetInPrefix: '',
      resetInSuffix: '后',
      durationJoin: ' ',
      durationDay: '天',
      durationHour: '小时',
      durationMinute: '分钟',
      membership: '会员等级',
      usageEndpoint: '额度接口地址',
      usageEndpointHint: '返回 Kimi Coding 订阅用量的端点地址。',
      settings: '同步设置',
      settingsHint: '修改会保存到当前 DSH profile。',
      platform: '平台',
      platformHint: '用所选 Kimi Code 平台的预设值回填下方三个端点字段。官方与自定义地址混用时显示为“自定义”。若 profile 路由自带 Base URL，请同步改为同一域名；两个平台签发的 API 密钥不互通。',
      platform_china: '中国版 (api.kimi.com)',
      platform_global: '国际版 (api.kimi.ai)',
      platform_custom: '自定义（混合端点）',
      endpoint: '模型目录地址',
      endpointHint: '返回 OpenAI 兼容模型列表的端点地址。',
      baseURL: '路由 Base URL',
      baseURLHint: '仅在 kimi-coding 路由尚未声明 Base URL 时写入。',
      apiKeyEnv: '凭据变量名',
      apiKeyEnvHint: '只填写环境变量名称，不要在这里粘贴 API Key。',
      defaultMaxTokens: '默认输出 Token 上限',
      defaultMaxTokensHint: '线上目录没有给出输出上限、且不属于已知模型时，用于新发现的模型。已知 Kimi Coding 模型使用 pi-ai 1.6.0 的限制。',
      syncOnStart: 'DSH 启动时同步',
      syncOnStartHint: '下次插件激活时在后台执行一次同步。',
      syncIntervalMinutes: '定时同步间隔（分钟）',
      syncIntervalMinutesHint: 'DSH 运行期间按此间隔在后台同步；0 表示关闭，可填 1–10080（最长一周）。',
      showChatQuota: '在聊天窗显示额度',
      showChatQuotaHint: '当前聊天使用 Kimi Coding 时显示紧凑额度胶囊，可见状态下每分钟刷新。',
      chatQuotaBorder: '聊天额度边框',
      chatQuotaBorderHint: '为聊天额度指示器绘制带边框的胶囊外观；纯文本样式始终无边框。',
      chatRollingShort: '5 小时',
      chatWeeklyShort: '7 天',
      chatLoading: '…',
      chatUnavailable: '额度不可用',
      quotaTimeout: '额度请求超时，请重新刷新。',
      chatQuotaStyle: '聊天额度样式',
      chatQuotaStyleHint: '选择聊天输入框中额度指示器的外观。',
      chatQuotaStyle_badge: '徽章（默认）',
      chatQuotaStyle_plain: '纯文本',
      chatQuotaStyle_bars: '双进度条',
      chatQuotaStyle_ring: '进度环',
      chatQuotaStyle_bar: '单进度条',
      chatQuotaStyle_dot: '状态圆点',
      stylePreview: '预览',
      save: '保存设置',
      saving: '正在保存…',
      discard: '放弃修改',
      saved: '设置已保存。',
      saveRejected: 'profile 拒绝了这次修改，请刷新后重试。',
      saveConflict: '设置已在其他位置更新。请检查草稿；再次保存将覆盖这些字段，也可以选择放弃修改。',
      staleResult: '下面保留的是上一次结果，可能已经过期。',
      loading: '正在读取设置…',
      unavailable: '当前 profile 无法使用设置服务。',
      readOnly: '当前 profile 为只读，不能在这里修改设置。',
      overridden: '已自定义',
      invalidUrl: '请输入 HTTPS 地址；本机回环地址也支持 HTTP。',
      invalidCredentialRef: '请输入环境变量名称，例如 KIMI_CODING_API_KEY。',
      invalidTokens: '请输入正整数。',
      invalidInterval: '请填写 0（关闭），或 1–10080 之间的整数分钟。',
      operationFailed: '操作失败',
    }

    function stringList(value, field) {
      if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
        throw new Error(`Invalid Kimi Coding sync result: ${field}`)
      }
      return [...value]
    }
    function parseSyncResult(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Invalid Kimi Coding sync result')
      }
      if (typeof value.provider !== 'string' || typeof value.endpoint !== 'string'
        || typeof value.checkedAt !== 'string' || !Number.isFinite(Date.parse(value.checkedAt))
        || typeof value.applied !== 'boolean' || typeof value.changed !== 'boolean'
        || typeof value.syncToken !== 'string' || value.syncToken.length === 0
        || typeof value.confirmationStale !== 'boolean') {
        throw new Error('Invalid Kimi Coding sync result metadata')
      }
      if (!Array.isArray(value.live)) throw new Error('Invalid Kimi Coding live model list')
      const live = value.live.map((model) => {
        if (model === null || typeof model !== 'object' || Array.isArray(model)
          || typeof model.id !== 'string' || typeof model.name !== 'string') {
          throw new Error('Invalid Kimi Coding live model')
        }
        return { id: model.id, name: model.name }
      })
      return {
        provider: value.provider,
        endpoint: value.endpoint,
        checkedAt: value.checkedAt,
        live,
        served: stringList(value.served, 'served'),
        added: stringList(value.added, 'added'),
        kept: stringList(value.kept, 'kept'),
        removed: stringList(value.removed, 'removed'),
        pinnedKept: stringList(value.pinnedKept, 'pinnedKept'),
        applied: value.applied,
        changed: value.changed,
        syncToken: value.syncToken,
        confirmationStale: value.confirmationStale,
      }
    }
    function parseQuotaWindow(value, field) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`Invalid Kimi Coding quota ${field}`)
      }
      const result = {}
      for (const key of ['limit', 'used', 'remaining', 'usedPercent']) {
        if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < 0) {
          throw new Error(`Invalid Kimi Coding quota ${field}.${key}`)
        }
        result[key] = value[key]
      }
      if (typeof value.resetAt !== 'string' || !Number.isFinite(Date.parse(value.resetAt))) {
        throw new Error(`Invalid Kimi Coding quota ${field}.resetAt`)
      }
      result.resetAt = value.resetAt
      if (value.durationMinutes !== undefined) {
        if (!Number.isInteger(value.durationMinutes) || value.durationMinutes <= 0) {
          throw new Error(`Invalid Kimi Coding quota ${field}.durationMinutes`)
        }
        result.durationMinutes = value.durationMinutes
      }
      return result
    }
    function parseUsageResult(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)
        || typeof value.checkedAt !== 'string' || !Number.isFinite(Date.parse(value.checkedAt))) {
        throw new Error('Invalid Kimi Coding quota result')
      }
      const parseTrend = (trend) => {
        if (trend === null || typeof trend !== 'object' || Array.isArray(trend)
          || !Array.isArray(trend.rolling) || !Array.isArray(trend.weekly)
          || trend.rolling.some(item => typeof item !== 'number' || !Number.isFinite(item))
          || trend.weekly.some(item => typeof item !== 'number' || !Number.isFinite(item))
          || !(trend.rollingHoursToExhaustion === null
            || (typeof trend.rollingHoursToExhaustion === 'number' && Number.isFinite(trend.rollingHoursToExhaustion)))
          || !(trend.weeklyHoursToExhaustion === null
            || (typeof trend.weeklyHoursToExhaustion === 'number' && Number.isFinite(trend.weeklyHoursToExhaustion)))) {
          throw new Error('Invalid Kimi Coding quota trend')
        }
        return {
          rolling: [...trend.rolling], weekly: [...trend.weekly],
          rollingHoursToExhaustion: trend.rollingHoursToExhaustion,
          weeklyHoursToExhaustion: trend.weeklyHoursToExhaustion,
        }
      }
      return {
        checkedAt: value.checkedAt,
        rolling: parseQuotaWindow(value.rolling, 'rolling'),
        weekly: parseQuotaWindow(value.weekly, 'weekly'),
        ...typeof value.membership === 'string' ? { membership: value.membership } : {},
        ...value.trend === undefined ? {} : { trend: parseTrend(value.trend) },
      }
    }
    const usageCodec = {
      mode: 'strict', typeSymbol: 'dsh-kimi-coding-models#UsageResult',
      schema: { parse: parseUsageResult }, create: () => ({ parse: parseUsageResult }),
    }
    function parseModelSummary(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)
        || typeof value.id !== 'string' || value.id.length === 0) {
        throw new Error('Invalid Kimi Coding model entry')
      }
      const model = { id: value.id }
      if (value.name !== undefined) {
        if (typeof value.name !== 'string') throw new Error('Invalid Kimi Coding model name')
        model.name = value.name
      }
      for (const key of ['maxTokens', 'contextWindow', 'piContextWindow', 'piMaxTokens']) {
        if (value[key] === undefined) continue
        if (!Number.isInteger(value[key]) || value[key] <= 0) throw new Error(`Invalid Kimi Coding model ${key}`)
        model[key] = value[key]
      }
      return model
    }
    function parseModelsResult(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)
        || typeof value.provider !== 'string' || !Array.isArray(value.models)) {
        throw new Error('Invalid Kimi Coding model list')
      }
      return { provider: value.provider, models: value.models.map(parseModelSummary) }
    }
    function parseModelsInput(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value) || !Array.isArray(value.models)) {
        throw new Error('Invalid Kimi Coding model-limit request')
      }
      const models = value.models.map((entry) => {
        if (entry === null || typeof entry !== 'object' || Array.isArray(entry)
          || typeof entry.id !== 'string' || entry.id.length === 0) {
          throw new Error('Invalid Kimi Coding model-limit entry')
        }
        const model = { id: entry.id }
        for (const field of ['contextWindow', 'maxTokens']) {
          if (entry[field] === undefined) continue
          if (entry[field] === null) {
            model[field] = null
            continue
          }
          if (!Number.isInteger(entry[field]) || entry[field] <= 0) {
            throw new Error('Invalid Kimi Coding model-limit value')
          }
          model[field] = entry[field]
        }
        if (!Object.hasOwn(model, 'contextWindow') && !Object.hasOwn(model, 'maxTokens')) {
          throw new Error('Invalid Kimi Coding model-limit entry')
        }
        return model
      })
      return { models }
    }
    const modelsCodec = {
      mode: 'strict', typeSymbol: 'dsh-kimi-coding-models#ModelsResult',
      schema: { parse: parseModelsResult }, create: () => ({ parse: parseModelsResult }),
    }
    const modelsInputCodec = {
      mode: 'strict', typeSymbol: 'dsh-kimi-coding-models#ModelsInput',
      schema: { parse: parseModelsInput }, create: () => ({ parse: parseModelsInput }),
    }
    const resultCodec = {
      mode: 'strict',
      typeSymbol: 'dsh-kimi-coding-models#SyncResult',
      schema: { parse: parseSyncResult },
      create: () => ({ parse: parseSyncResult }),
    }
    const parseApply = (value) => {
      if (typeof value !== 'boolean') throw new Error('apply must be a boolean')
      return value
    }
    const applyCodec = {
      mode: 'strict',
      typeSymbol: 'dsh-kimi-coding-models#Apply',
      schema: { parse: parseApply },
      create: () => ({ parse: parseApply }),
    }
    const parseConfirmation = (value) => {
      if (value === undefined) return undefined
      if (typeof value !== 'string') throw new Error('confirmation must be a string')
      return value
    }
    const forceCodec = {
      mode: 'strict', typeSymbol: 'dsh-kimi-coding-models#Force',
      schema: { parse: (value) => {
        if (typeof value !== 'boolean') throw new Error('force must be a boolean')
        return value
      } }, create: () => ({ parse: (value) => {
        if (typeof value !== 'boolean') throw new Error('force must be a boolean')
        return value
      } }),
    }
    const confirmationCodec = {
      mode: 'strict', typeSymbol: 'dsh-kimi-coding-models#Confirmation',
      schema: { parse: parseConfirmation }, create: () => ({ parse: parseConfirmation }),
    }
    const REMOTE = {
      package: 'dsh-kimi-coding-models',
      descriptors: [
        {
          id: 'dsh-kimi-coding-models#kimiCodingModels/read',
          service: 'kimiCodingModels', namespace: 'kimiCodingModels', method: 'read',
          invocation: { kind: 'direct' }, parameters: [],
          cancellation: { parameter: 'signal' }, result: resultCodec,
        },
        {
          id: 'dsh-kimi-coding-models#kimiCodingModels/usage',
          service: 'kimiCodingModels', namespace: 'kimiCodingModels', method: 'usage',
          invocation: { kind: 'direct' },
          parameters: [
            { name: 'force', wire: 'force', source: 'json', codec: forceCodec },
          ],
          cancellation: { parameter: 'signal' }, result: usageCodec,
        },
        {
          id: 'dsh-kimi-coding-models#kimiCodingModels/sync',
          service: 'kimiCodingModels', namespace: 'kimiCodingModels', method: 'sync',
          invocation: { kind: 'direct' },
          parameters: [
            { name: 'apply', wire: 'apply', source: 'json', codec: applyCodec },
            { name: 'confirmation', wire: 'confirmation', source: 'json', codec: confirmationCodec },
          ],
          cancellation: { parameter: 'signal' }, result: resultCodec,
        },
        {
          id: 'dsh-kimi-coding-models#kimiCodingModels/models',
          service: 'kimiCodingModels', namespace: 'kimiCodingModels', method: 'models',
          invocation: { kind: 'direct' }, parameters: [],
          cancellation: { parameter: 'signal' }, result: modelsCodec,
        },
        {
          id: 'dsh-kimi-coding-models#kimiCodingModels/saveModels',
          service: 'kimiCodingModels', namespace: 'kimiCodingModels', method: 'saveModels',
          invocation: { kind: 'direct' },
          parameters: [
            { name: 'input', wire: 'input', source: 'json', codec: modelsInputCodec },
          ],
          cancellation: { parameter: 'signal' }, result: modelsCodec,
        },
      ],
    }

    const styles = {
      page: { display: 'grid', gap: 20, color: 'var(--dsw-alias-label-primary)', maxWidth: 780 },
      card: {
        display: 'grid', gap: 14, padding: 18, borderRadius: 12,
        border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-card-fill)',
      },
      heading: { margin: 0, fontSize: 16, lineHeight: 1.4, fontWeight: 600 },
      description: { margin: 0, color: 'var(--dsw-alias-label-secondary)', fontSize: 13, lineHeight: 1.6 },
      hint: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: 12, lineHeight: 1.55 },
      actions: { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
      button: {
        appearance: 'none', border: '1px solid var(--dsw-alias-border-l3)', borderRadius: 8,
        background: 'var(--dsw-alias-button-elevated-fill)', color: 'var(--dsw-alias-label-primary)',
        padding: '8px 13px', font: 'inherit', fontSize: 13, cursor: 'pointer',
      },
      primaryButton: {
        appearance: 'none', border: '1px solid var(--dsw-alias-button-primary-fill)', borderRadius: 8,
        background: 'var(--dsw-alias-button-primary-fill)', color: 'var(--dsw-alias-label-primary-foreground)',
        padding: '8px 13px', font: 'inherit', fontSize: 13, cursor: 'pointer',
      },
      status: { margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--dsw-alias-label-secondary)' },
      error: {
        margin: 0, padding: 10, borderRadius: 8, fontSize: 12, lineHeight: 1.55,
        color: 'var(--dsw-alias-state-error-primary)', background: 'var(--dsw-alias-interactive-bg-hover-danger)',
      },
      modelList: { display: 'grid', borderTop: '1px solid var(--dsw-alias-border-l2)' },
      modelRow: {
        display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 0', borderBottom: '1px solid var(--dsw-alias-border-l1)', minWidth: 0,
      },
      modelName: { fontSize: 13, fontWeight: 500, overflowWrap: 'anywhere' },
      modelId: { color: 'var(--dsw-alias-label-tertiary)', fontSize: 11, fontFamily: 'monospace', overflowWrap: 'anywhere' },
      limitFields: { display: 'flex', flexWrap: 'wrap', gap: 12, flex: 'none' },
      limitField: { display: 'grid', gap: 4 },
      pinButton: { appearance: 'none', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, padding: '2px 4px', flex: 'none', opacity: 0.75 },
      badge: {
        flex: 'none', padding: '2px 7px', borderRadius: 6, fontSize: 11,
        color: 'var(--dsw-alias-label-secondary)', background: 'var(--dsw-alias-interactive-bg-hover)',
      },
      quotaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 },
      quotaCard: { display: 'grid', gap: 8, padding: 12, borderRadius: 9, background: 'var(--dsw-alias-interactive-bg-hover)' },
      quotaHead: { display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, fontWeight: 500 },
      progress: { height: 6, borderRadius: 99, overflow: 'hidden', background: 'var(--dsw-alias-bg-skeleton)' },
      progressFill: { height: '100%', borderRadius: 99, background: 'var(--dsw-alias-state-business-primary)' },
      chatRoot: { position: 'relative', display: 'inline-flex', maxWidth: '100%', minWidth: 0, fontFamily: 'inherit' },
      chatTrigger: {
        appearance: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
        maxWidth: '100%', minWidth: 0, overflow: 'hidden', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 999,
        background: 'var(--dsw-alias-button-elevated-fill)', color: 'var(--dsw-alias-label-secondary)',
        padding: '5px 9px', font: 'inherit', fontSize: 11.5, lineHeight: 1.5, cursor: 'pointer',
        whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
      },
      chatTriggerPlain: {
        appearance: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
        maxWidth: '100%', minWidth: 0, overflow: 'hidden', border: 'none', background: 'none',
        color: 'var(--dsw-alias-label-tertiary)', padding: '4px 6px', font: 'inherit',
        fontSize: 11.5, lineHeight: 1.5, cursor: 'pointer', whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
      },
      chatBars: { display: 'inline-flex', alignItems: 'center', gap: 9, minWidth: 0, maxWidth: '100%', overflow: 'hidden' },
      chatBarGroup: { display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 },
      chatBarTrack: {
        display: 'inline-block', width: 22, minWidth: 6, flex: '0 1 22px', height: 4, borderRadius: 99,
        overflow: 'hidden', background: 'var(--dsw-alias-bg-skeleton)',
      },
      chatBarFill: { display: 'block', height: '100%', background: 'var(--dsw-alias-state-business-primary)' },
      chatText: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' },
      stylePreview: {
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, minWidth: 0, padding: 12, borderRadius: 8,
        background: 'var(--dsw-alias-interactive-bg-hover)', color: 'var(--dsw-alias-label-secondary)',
      },
      chatPanel: {
        position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, zIndex: 40,
        boxSizing: 'border-box', width: 330, maxWidth: 'calc(100vw - 32px)', maxHeight: '70vh', overflowY: 'auto',
        display: 'grid', gap: 12, padding: 14, borderRadius: 12,
        border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)',
        color: 'var(--dsw-alias-label-primary)',
      },
      chatHeading: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
      fieldGrid: { display: 'grid', gap: 16 },
      field: { display: 'grid', gap: 6 },
      label: { fontSize: 13, fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' },
      input: {
        boxSizing: 'border-box', width: '100%', border: '1px solid var(--dsw-alias-border-l3)',
        borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)',
        padding: '9px 11px', font: 'inherit', fontSize: 13,
      },
      checkboxRow: { display: 'flex', gap: 10, alignItems: 'flex-start' },
      checkbox: { width: 16, height: 16, margin: '2px 0 0', flex: 'none' },
      footer: { color: 'var(--dsw-alias-label-tertiary)', fontSize: 11 },
    }

    function Button({ primary = false, disabled = false, ...props }) {
      const style = { ...(primary ? styles.primaryButton : styles.button), ...(disabled ? { opacity: 0.5, cursor: 'default' } : {}) }
      return h('button', { ...props, disabled, style })
    }

    function SectionIcon(props) {
      const size = props.size || 18
      // A neutral geometric "K" drawn from strokes — not the Kimi brand mark.
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M7 5v14', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }),
        h('path', { d: 'M17 5l-8 7 8 7', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }))
    }

    function LockIcon(props) {
      const size = props.size || 14
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true,
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
      },
        h('rect', { x: 4, y: 11, width: 16, height: 9.5, rx: 2 }),
        props.locked
          ? h('path', { d: 'M8 11V7.5a4 4 0 0 1 8 0V11' })
          : h('path', { d: 'M8 11V7.5a4 4 0 0 1 7.9-0.8' }))
    }

    function SyncPanel(props) {
      const { t, form } = props
      const [state, setState] = React.useState({ busy: null, result: null, error: null, stale: false })
      const [confirmRemoval, setConfirmRemoval] = React.useState(false)
      const mounted = React.useRef(true)
      const activeController = React.useRef()
      const config = React.useSyncExternalStore(
        listener => form.subscribe(listener),
        () => form.getSnapshot(),
        () => form.getSnapshot(),
      )
      const contextKey = JSON.stringify([
        config.value?.endpoint, config.value?.baseURL, config.value?.apiKeyEnv, config.value?.defaultMaxTokens,
      ])
      React.useEffect(() => {
        mounted.current = true
        return () => {
          mounted.current = false
          activeController.current?.abort()
        }
      }, [])
      React.useEffect(() => {
        activeController.current?.abort()
        setConfirmRemoval(false)
        setState({ busy: null, result: null, error: null, stale: false })
      }, [contextKey])
      const run = async (kind) => {
        activeController.current?.abort()
        const controller = new AbortController()
        activeController.current = controller
        const confirmation = kind === 'sync' ? state.result?.syncToken : undefined
        setConfirmRemoval(false)
        setState(previous => ({ ...previous, busy: kind, error: null, stale: false }))
        try {
          const result = kind === 'sync'
            ? await props.sync(confirmation, controller.signal)
            : await props.check(controller.signal)
          if (mounted.current && activeController.current === controller) {
            setState({ busy: null, result, error: null, stale: false })
          }
        } catch (error) {
          if (mounted.current && activeController.current === controller && !controller.signal.aborted) {
            setState(previous => ({
              ...previous, busy: null, stale: previous.result !== null,
              error: error instanceof Error ? error.message : String(error),
            }))
          }
        } finally {
          if (activeController.current === controller) activeController.current = undefined
        }
      }
      const result = state.result
      const busy = state.busy !== null
      const needsConfirmation = result !== null && !result.applied && result.changed && result.removed.length > 0
      const requestSync = () => {
        if (needsConfirmation && !confirmRemoval) {
          setConfirmRemoval(true)
          return
        }
        void run('sync')
      }
      let summary = t('checkFirst')
      if (result?.applied) summary = t('synced')
      else if (result?.changed) summary = t('updateAvailable')
      else if (result) summary = t('upToDate')
      return h('section', { style: styles.card, 'aria-labelledby': 'kimi-coding-models-title' },
        h('h2', { id: 'kimi-coding-models-title', style: styles.heading }, t('title')),
        h('p', { style: styles.description }, t('description')),
        h('p', { style: styles.hint }, t('syncWarning')),
        h('div', { style: styles.actions },
          h(Button, { type: 'button', disabled: busy, onClick: () => { void run('check') } },
            t(state.busy === 'check' ? 'checking' : 'check')),
          h(Button, {
            type: 'button', primary: true,
            disabled: busy || !result || result.applied || !result.changed, onClick: requestSync,
          }, t(state.busy === 'sync' ? 'syncing' : confirmRemoval ? 'confirmSync' : 'sync'))),
        h('div', { 'aria-live': 'polite' }, h('p', { style: styles.status }, summary)),
        result?.confirmationStale ? h('p', { role: 'alert', style: styles.error }, t('confirmationStale')) : null,
        confirmRemoval ? h('p', { role: 'alert', style: styles.error }, t('removalWarning')) : null,
        state.error ? h('p', { role: 'alert', style: styles.error }, `${t('operationFailed')}: ${state.error}`) : null,
        state.stale ? h('p', { style: styles.hint }, t('staleResult')) : null,
        result ? h(React.Fragment, null,
          h('div', { style: styles.footer }, `${t('endpoint')}: ${result.endpoint}`),
          h('div', { style: styles.footer }, `${t('checkedAt')}: ${new Date(result.checkedAt).toLocaleString(props.getLocale?.())}`),
          result.removed.length > 0 ? h('p', { style: styles.status }, `${t('removed')}: ${result.removed.join(', ')}`) : null,
          result.pinnedKept.length > 0 ? h('p', { style: styles.status }, `${t('pinnedKept')}: ${result.pinnedKept.join(', ')}`) : null,
          h('div', null,
            h('h3', { style: { ...styles.heading, fontSize: 13, marginBottom: 8 } }, `${t('models')} (${result.live.length})`),
            h('div', { style: styles.modelList }, result.live.map((model) => {
              const served = result.served.includes(model.id)
              const added = result.added.includes(model.id)
              const label = added && result.applied ? t('added') : served ? t('available') : t('missing')
              return h('div', { key: model.id, style: styles.modelRow },
                h('div', { style: { minWidth: 0 } },
                  h('div', { style: styles.modelName }, model.name),
                  h('div', { style: styles.modelId }, model.id)),
                h('span', { style: styles.badge }, label))
            })))) : null)
    }

    function ModelSettingsPanel(props) {
      const { t } = props
      const [state, setState] = React.useState({
        status: 'loading', models: [], draft: {}, error: null, saving: false, saved: false,
      })
      const mounted = React.useRef(true)
      const form = props.form
      const formSnap = React.useSyncExternalStore(
        listener => form.subscribe(listener),
        () => form.getSnapshot(),
        () => form.getSnapshot(),
      )
      const pinnedIds = new Set(Array.isArray(formSnap.value?.pinnedModels) ? formSnap.value.pinnedModels : [])
      const togglePin = async (id) => {
        const next = pinnedIds.has(id) ? [...pinnedIds].filter(item => item !== id) : [...pinnedIds, id]
        const snapshot = form.getSnapshot()
        if (snapshot.status !== 'ready' || !snapshot.writable) return
        try {
          const accepted = await form.mutate([{ op: 'set', path: ['pinnedModels'], value: next }], snapshot.revision)
          if (!accepted) setState(previous => ({ ...previous, error: t('saveConflict'), saved: false }))
        } catch (error) {
          setState(previous => ({
            ...previous,
            error: error instanceof Error ? error.message : String(error),
          }))
        }
      }
      const load = async () => {
        setState(previous => ({ ...previous, status: 'loading', error: null, saved: false }))
        try {
          const result = await props.models()
          if (!mounted.current) return
          setState({ status: 'ready', models: result.models, draft: {}, error: null, saving: false, saved: false })
        } catch (error) {
          if (!mounted.current) return
          setState(previous => ({
            ...previous, status: 'ready',
            error: error instanceof Error ? error.message : String(error),
          }))
        }
      }
      React.useEffect(() => {
        mounted.current = true
        void load()
        return () => { mounted.current = false }
      }, [])
      const edit = (id, field, value) => {
        setState(previous => ({
          ...previous,
          draft: { ...previous.draft, [id]: { ...previous.draft[id], [field]: value } },
          saved: false,
          error: null,
        }))
      }
      const original = (model, field) => model[field] === undefined ? '' : String(model[field])
      const valueOf = (model, field) => {
        const draft = state.draft[model.id]
        return draft !== undefined && Object.hasOwn(draft, field) ? draft[field] : original(model, field)
      }
      const placeholderOf = (model, field) => {
        const suggested = field === 'contextWindow' ? model.piContextWindow : model.piMaxTokens
        return suggested === undefined ? t('modelCapsPlaceholder') : suggested.toLocaleString()
      }
      const dirty = state.models.some(model => ['contextWindow', 'maxTokens']
        .some(field => valueOf(model, field) !== original(model, field)))
      const save = async () => {
        const models = []
        for (const model of state.models) {
          const entry = { id: model.id }
          let changed = false
          for (const field of ['contextWindow', 'maxTokens']) {
            const raw = String(valueOf(model, field)).trim()
            if (raw === original(model, field)) continue
            changed = true
            if (raw === '') {
              entry[field] = null
              continue
            }
            const value = Number(raw)
            if (!Number.isInteger(value) || value <= 0) {
              setState(previous => ({ ...previous, error: t('capsInvalid'), saved: false }))
              return
            }
            entry[field] = value
          }
          if (changed) models.push(entry)
        }
        if (models.length === 0) {
          setState(previous => ({ ...previous, draft: {}, saved: true, error: null }))
          return
        }
        setState(previous => ({ ...previous, saving: true, error: null, saved: false }))
        try {
          const result = await props.saveModels({ models })
          if (!mounted.current) return
          setState({ status: 'ready', models: result.models, draft: {}, error: null, saving: false, saved: true })
        } catch (error) {
          if (!mounted.current) return
          setState(previous => ({
            ...previous, saving: false,
            error: error instanceof Error ? error.message : String(error),
          }))
        }
      }
      const disabled = state.status !== 'ready' || state.saving
      const limitField = (model, field, label) => h('label', { style: styles.limitField },
        h('span', { style: styles.hint }, label),
        h('input', {
          type: 'number', min: 1, step: 1, style: { ...styles.input, width: 150, flex: 'none' },
          value: valueOf(model, field), placeholder: placeholderOf(model, field), disabled: state.saving,
          'aria-label': `${model.name ?? model.id} ${label}`,
          onChange: event => edit(model.id, field, event.target.value),
        }))
      return h('section', { style: styles.card, 'aria-labelledby': 'kimi-coding-caps-title' },
        h('h2', { id: 'kimi-coding-caps-title', style: styles.heading }, t('modelCaps')),
        h('p', { style: styles.description }, t('modelCapsHint')),
        h('div', { style: styles.actions },
          h(Button, { type: 'button', primary: true, disabled: disabled || !dirty, onClick: () => { void save() } },
            t(state.saving ? 'savingCaps' : 'saveCaps')),
          h(Button, { type: 'button', disabled: disabled, onClick: () => { void load() } }, t('capsReload'))),
        state.error ? h('p', { role: 'alert', style: styles.error }, `${t('operationFailed')}: ${state.error}`) : null,
        state.saved ? h('p', { style: styles.status }, t('capsSaved')) : null,
        state.status === 'loading' ? h('p', { style: styles.status }, t('loading'))
          : state.models.length === 0
            ? state.error ? null : h('p', { style: styles.status }, t('modelCapsEmpty'))
            : h('div', { style: styles.modelList }, state.models.map(model => h('div', { key: model.id, style: styles.modelRow },
              h('div', { style: { minWidth: 0, flex: '1 1 180px' } },
                h('div', { style: styles.modelName }, model.name ?? model.id,
                  pinnedIds.has(model.id) ? h('span', { style: styles.badge }, t('pinnedBadge')) : null),
                h('div', { style: styles.modelId }, model.id)),
              h('button', {
                type: 'button',
                title: t(pinnedIds.has(model.id) ? 'unpinModel' : 'pinModel'),
                'aria-label': t(pinnedIds.has(model.id) ? 'unpinModel' : 'pinModel'),
                'aria-pressed': pinnedIds.has(model.id),
                disabled: formSnap.status !== 'ready' || !formSnap.writable,
                style: styles.pinButton,
                onClick: () => { void togglePin(model.id) },
              }, h(LockIcon, { locked: pinnedIds.has(model.id) })),
              h('div', { style: styles.limitFields },
                limitField(model, 'contextWindow', t('contextWindow')),
                limitField(model, 'maxTokens', t('maxOutput')))))))
    }

    function useNow(intervalMs = 30_000) {
      const [now, setNow] = React.useState(() => Date.now())
      React.useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), intervalMs)
        return () => clearInterval(timer)
      }, [intervalMs])
      return now
    }

    function resetCountdown(resetAt, now, t) {
      const remaining = Date.parse(resetAt) - now
      if (!Number.isFinite(remaining)) return ''
      if (remaining <= 0) return t('resetSoon')
      const minutes = Math.ceil(remaining / 60_000)
      const days = Math.floor(minutes / 1440)
      const hours = Math.floor((minutes % 1440) / 60)
      const mins = minutes % 60
      const parts = []
      if (days > 0) parts.push(`${days}${t('durationDay')}`)
      if (hours > 0) parts.push(`${hours}${t('durationHour')}`)
      if (days === 0 && mins > 0) parts.push(`${mins}${t('durationMinute')}`)
      if (parts.length === 0) return t('resetSoon')
      return `${t('resetInPrefix')}${parts.join(t('durationJoin'))}${t('resetInSuffix')}`
    }

    function Sparkline({ points, label }) {
      if (!Array.isArray(points) || points.length < 2) return null
      const width = 120; const height = 22; const pad = 2
      const step = (width - 2 * pad) / (points.length - 1)
      const coords = points.map((point, index) => {
        const x = pad + index * step
        const y = height - pad - (Math.max(0, Math.min(100, point)) / 100) * (height - 2 * pad)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      return h('svg', {
        width, height, viewBox: `0 0 ${width} ${height}`, role: 'img',
        'aria-label': `${label} trend`,
      }, h('polyline', {
        points: coords.join(' '), fill: 'none',
        stroke: 'var(--dsw-alias-state-business-primary)', strokeWidth: 1.5,
        strokeLinejoin: 'round', strokeLinecap: 'round',
      }))
    }

    function QuotaWindow({ t, label, value, getLocale, spark, exhaustionHours }) {
      const now = useNow()
      const percent = Math.max(0, Math.min(100, value.usedPercent))
      const resetsAt = new Date(value.resetAt).toLocaleString(getLocale?.())
      const countdown = resetCountdown(value.resetAt, now, t)
      return h('div', { style: styles.quotaCard },
        h('div', { style: styles.quotaHead },
          h('span', null, label),
          h('span', null, `${percent.toFixed(1)}% ${t('used')}`)),
        h('div', {
          style: styles.progress, role: 'progressbar', 'aria-label': label,
          'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(percent * 10) / 10,
        }, h('div', { style: { ...styles.progressFill, width: `${percent}%` } })),
        h(Sparkline, { points: spark, label }),
        exhaustionHours === null || exhaustionHours === undefined ? null
          : h('p', { style: styles.hint }, t('exhaustionIn').replace('{h}', String(Math.round(exhaustionHours)))),
        h('p', { style: styles.hint }, `${t('resetsAt')}: ${resetsAt}${countdown === '' ? '' : ` (${countdown})`}`))
    }

    function QuotaPanel(props) {
      const { t, form } = props
      const [state, setState] = React.useState({ busy: false, result: null, error: null, stale: false })
      const mounted = React.useRef(true)
      const activeController = React.useRef()
      const config = React.useSyncExternalStore(
        listener => form.subscribe(listener),
        () => form.getSnapshot(),
        () => form.getSnapshot(),
      )
      const contextKey = JSON.stringify([config.value?.usageEndpoint, config.value?.apiKeyEnv])
      React.useEffect(() => {
        mounted.current = true
        return () => {
          mounted.current = false
          activeController.current?.abort()
        }
      }, [])
      React.useEffect(() => {
        activeController.current?.abort()
        setState({ busy: false, result: null, error: null, stale: false })
        // Show the current quota right away: a cached reading renders
        // immediately, a cold cache performs one upstream read.
        void refresh(false)
      }, [contextKey])
      const refresh = async (force = true) => {
        activeController.current?.abort()
        const controller = new AbortController()
        activeController.current = controller
        setState(previous => ({ ...previous, busy: true, error: null, stale: false }))
        try {
          const result = await props.usage(force, controller.signal)
          if (mounted.current && activeController.current === controller) {
            setState({ busy: false, result, error: null, stale: false })
          }
        } catch (error) {
          if (mounted.current && activeController.current === controller && !controller.signal.aborted) {
            setState(previous => ({
              ...previous, busy: false, stale: previous.result !== null, error: error instanceof Error ? error.message : String(error),
            }))
          }
        } finally {
          if (activeController.current === controller) activeController.current = undefined
        }
      }
      const result = state.result
      return h('section', { style: styles.card, 'aria-labelledby': 'kimi-coding-quota-title' },
        h('h2', { id: 'kimi-coding-quota-title', style: styles.heading }, t('quota')),
        h('p', { style: styles.description }, t('quotaHint')),
        h('div', { style: styles.actions }, h(Button, {
          type: 'button', disabled: state.busy, onClick: () => { void refresh() },
        }, t(state.busy ? 'refreshingQuota' : 'refreshQuota'))),
        !result && !state.error ? h('p', { style: styles.status }, t('quotaFirst')) : null,
        state.error ? h('p', { role: 'alert', style: styles.error }, `${t('operationFailed')}: ${state.error}`) : null,
        state.stale ? h('p', { style: styles.hint }, t('staleResult')) : null,
        result ? h(React.Fragment, null,
          h('div', { style: styles.quotaGrid },
            h(QuotaWindow, {
              t, label: t('rollingQuota'), value: result.rolling, getLocale: props.getLocale,
              spark: result.trend?.rolling, exhaustionHours: result.trend?.rollingHoursToExhaustion,
            }),
            h(QuotaWindow, {
              t, label: t('weeklyQuota'), value: result.weekly, getLocale: props.getLocale,
              spark: result.trend?.weekly, exhaustionHours: result.trend?.weeklyHoursToExhaustion,
            })),
          result.membership ? h('p', { style: styles.status }, `${t('membership')}: ${result.membership}`) : null,
          h('div', { style: styles.footer }, `${t('checkedAt')}: ${new Date(result.checkedAt).toLocaleString(props.getLocale?.())}`)) : null)
    }

    function validUrl(value) {
      try {
        const url = new URL(value)
        return url.protocol === 'https:' || (url.protocol === 'http:'
          && (url.hostname === 'localhost' || url.hostname === '[::1]' || /^127(?:\.\d+){3}$/.test(url.hostname)))
      } catch {
        return false
      }
    }

    function SettingsPanel(props) {
      const { form, t } = props
      const snapshot = React.useSyncExternalStore(
        listener => form.subscribe(listener),
        () => form.getSnapshot(),
        () => form.getSnapshot(),
      )
      const [draft, setDraft] = React.useState({})
      const [saveState, setSaveState] = React.useState({ busy: false, error: null, saved: false, field: null })
      const editRevision = React.useRef(null)
      const values = { ...DEFAULTS, ...(snapshot.value ?? {}), ...draft }
      const dirty = Object.keys(draft).length > 0
      const disabled = !snapshot.writable || saveState.busy
      const edit = (field, value) => {
        if (!dirty) editRevision.current = snapshot.revision
        setDraft(previous => ({ ...previous, [field]: value }))
        setSaveState({ busy: false, error: null, saved: false, field: null })
      }
      const save = async () => {
        const next = { ...values }
        for (const field of ['endpoint', 'baseURL', 'usageEndpoint']) next[field] = String(next[field]).trim()
        next.apiKeyEnv = String(next.apiKeyEnv).trim()
        next.defaultMaxTokens = Number(next.defaultMaxTokens)
        next.syncIntervalMinutes = Number(next.syncIntervalMinutes)
        let error = null
        let invalidField = null
        if (!validUrl(next.endpoint)) { error = t('invalidUrl'); invalidField = 'endpoint' }
        else if (!validUrl(next.baseURL)) { error = t('invalidUrl'); invalidField = 'baseURL' }
        else if (!validUrl(next.usageEndpoint)) { error = t('invalidUrl'); invalidField = 'usageEndpoint' }
        else if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(next.apiKeyEnv)) { error = t('invalidCredentialRef'); invalidField = 'apiKeyEnv' }
        else if (!Number.isInteger(next.defaultMaxTokens) || next.defaultMaxTokens <= 0) { error = t('invalidTokens'); invalidField = 'defaultMaxTokens' }
        else if (!Number.isInteger(next.syncIntervalMinutes) || next.syncIntervalMinutes < 0
          || next.syncIntervalMinutes > MAX_SYNC_INTERVAL_MINUTES) { error = t('invalidInterval'); invalidField = 'syncIntervalMinutes' }
        if (error) {
          setSaveState({ busy: false, error, saved: false, field: invalidField })
          return
        }
        setSaveState({ busy: true, error: null, saved: false, field: null })
        try {
          const expectedRevision = editRevision.current ?? snapshot.revision
          const accepted = await form.mutate(Object.keys(draft).map(field => ({
            op: 'set', path: [field], value: next[field],
          })), expectedRevision)
          if (!accepted) {
            // The next click is an explicit overwrite after the conflict notice.
            editRevision.current = form.getSnapshot().revision
            setSaveState({ busy: false, error: t('saveConflict'), saved: false, field: null })
            return
          }
          editRevision.current = null
          setDraft({})
          setSaveState({ busy: false, error: null, saved: true, field: null })
        } catch (cause) {
          setSaveState({ busy: false, error: cause instanceof Error ? cause.message : String(cause), saved: false, field: null })
        }
      }
      const textField = (field) => {
        const numeric = field === 'defaultMaxTokens' || field === 'syncIntervalMinutes'
        const min = field === 'syncIntervalMinutes' ? 0 : 1
        const max = field === 'syncIntervalMinutes' ? MAX_SYNC_INTERVAL_MINUTES : undefined
        return h('div', { style: styles.field },
          h('label', { style: styles.label, htmlFor: `kimi-coding-${field}` },
            t(field),
            snapshot.user && Object.hasOwn(snapshot.user, field) ? h('span', { style: styles.badge }, t('overridden')) : null),
          h('input', {
            id: `kimi-coding-${field}`, style: styles.input, value: String(values[field]),
            type: numeric ? 'number' : 'text', min: numeric ? min : undefined,
            max, step: numeric ? 1 : undefined, spellCheck: false, disabled,
            'aria-describedby': `kimi-coding-${field}-hint${saveState.field === field ? ' kimi-coding-settings-error' : ''}`,
            'aria-invalid': saveState.field === field || undefined,
            onChange: event => edit(field, event.target.value),
          }),
          h('p', { id: `kimi-coding-${field}-hint`, style: styles.hint }, t(`${field}Hint`)))
      }
      const checkboxField = (field) => h('div', { style: styles.checkboxRow },
        h('input', {
          id: `kimi-coding-${field}`, type: 'checkbox', style: styles.checkbox,
          checked: values[field] === true, disabled,
          'aria-describedby': `kimi-coding-${field}-hint`,
          onChange: event => edit(field, event.target.checked),
        }),
        h('div', null,
          h('label', { htmlFor: `kimi-coding-${field}`, style: styles.label }, t(field)),
          h('p', { id: `kimi-coding-${field}-hint`, style: styles.hint }, t(`${field}Hint`))))
      const platformOf = (current) => {
        for (const key of ['china', 'global']) {
          const preset = PLATFORMS[key]
          if (current.endpoint === preset.endpoint
            && current.usageEndpoint === preset.usageEndpoint
            && current.baseURL === preset.baseURL) return key
        }
        return 'custom'
      }
      const platformField = () => h('div', { style: styles.field },
        h('label', { style: styles.label, htmlFor: 'kimi-coding-platform' },
          t('platform'),
          snapshot.user && Object.hasOwn(snapshot.user, 'platform') ? h('span', { style: styles.badge }, t('overridden')) : null),
        h('select', {
          id: 'kimi-coding-platform', style: styles.input, value: platformOf(values), disabled,
          'aria-describedby': 'kimi-coding-platform-hint',
          onChange: event => {
            const preset = PLATFORMS[event.target.value]
            if (preset === undefined) return
            edit('platform', event.target.value)
            edit('endpoint', preset.endpoint)
            edit('usageEndpoint', preset.usageEndpoint)
            edit('baseURL', preset.baseURL)
          },
        }, ['china', 'global'].map(key => h('option', { key, value: key }, t(`platform_${key}`)))
          .concat(platformOf(values) === 'custom'
            ? [h('option', { key: 'custom', value: 'custom', disabled: true }, t('platform_custom'))]
            : [])),
        h('p', { id: 'kimi-coding-platform-hint', style: styles.hint }, t('platformHint')))
      const styleField = () => h('div', { style: styles.field },
        h('label', { style: styles.label, htmlFor: 'kimi-coding-chatQuotaStyle' }, t('chatQuotaStyle')),
        h('select', {
          id: 'kimi-coding-chatQuotaStyle', style: styles.input, value: values.chatQuotaStyle, disabled,
          'aria-describedby': 'kimi-coding-chatQuotaStyle-hint',
          onChange: event => edit('chatQuotaStyle', event.target.value),
        }, ['badge', 'plain', 'bars', 'ring', 'bar', 'dot'].map(style => h('option', { key: style, value: style }, t(`chatQuotaStyle_${style}`)))),
        h('p', { id: 'kimi-coding-chatQuotaStyle-hint', style: styles.hint }, t('chatQuotaStyleHint')),
        h('div', { style: styles.stylePreview },
          h('span', { style: styles.hint }, t('stylePreview')),
          h('span', {
            'aria-hidden': true,
            style: { ...(values.chatQuotaStyle === 'plain' || values.chatQuotaBorder === false ? styles.chatTriggerPlain : styles.chatTrigger), cursor: 'default' },
          }, h(ChatQuotaTriggerContent, { t, style: values.chatQuotaStyle, usage: PREVIEW_QUOTA }))))
      return h('section', { style: styles.card, 'aria-labelledby': 'kimi-coding-settings-title' },
        h('h2', { id: 'kimi-coding-settings-title', style: styles.heading }, t('settings')),
        h('p', { style: styles.description }, t('settingsHint')),
        snapshot.status !== 'ready' ? h('p', { style: styles.status }, t(snapshot.status === 'loading' ? 'loading' : 'unavailable')) : h(React.Fragment, null,
          !snapshot.writable ? h('p', { style: styles.hint }, t('readOnly')) : null,
          h('div', { style: styles.fieldGrid },
            platformField(), textField('endpoint'), textField('baseURL'), textField('usageEndpoint'), textField('apiKeyEnv'), textField('defaultMaxTokens'),
            checkboxField('syncOnStart'), textField('syncIntervalMinutes'), checkboxField('showChatQuota'), styleField(), checkboxField('chatQuotaBorder')),
          h('div', { style: styles.actions },
            h(Button, { type: 'button', primary: true, disabled: disabled || !dirty, onClick: () => { void save() } },
              t(saveState.busy ? 'saving' : 'save')),
            h(Button, {
              type: 'button', disabled: saveState.busy || !dirty,
              onClick: () => { editRevision.current = null; setDraft({}); setSaveState({ busy: false, error: null, saved: false, field: null }) },
            }, t('discard'))),
          h('div', { 'aria-live': 'polite' },
            saveState.error ? h('p', { id: 'kimi-coding-settings-error', role: 'alert', style: styles.error }, saveState.error) : null,
            saveState.saved ? h('p', { style: styles.status }, t('saved')) : null)))
    }

    function ChatQuotaTriggerContent({ t, style, usage, label, stale = false }) {
      const text = label ?? (usage
        ? `${t('chatRollingShort')} ${Math.round(usage.rolling.usedPercent)}% · ${t('chatWeeklyShort')} ${Math.round(usage.weekly.usedPercent)}%`
        : '')
      if (style === 'bars' && usage) {
        const bar = (field, labelKey) => {
          const percent = Math.max(0, Math.min(100, Math.round(usage[field].usedPercent)))
          return h('span', { style: styles.chatBarGroup },
            h('span', null, t(labelKey)),
            h('span', { style: styles.chatBarTrack },
              h('span', { style: { ...styles.chatBarFill, width: `${percent}%` } })),
            h('span', null, `${percent}%`))
        }
        return h('span', { style: styles.chatBars },
          bar('rolling', 'chatRollingShort'), bar('weekly', 'chatWeeklyShort'), stale ? h('span', null, '*') : null)
      }
      if ((style === 'ring' || style === 'bar' || style === 'dot') && usage) {
        const percent = Math.max(0, Math.min(100, Math.round(usage.rolling.usedPercent)))
        const tone = percent >= 90 ? 'var(--dsw-alias-state-error-primary)'
          : percent >= 70 ? 'var(--dsw-alias-state-warn-primary)'
            : 'var(--dsw-alias-state-business-primary)'
        if (style === 'dot') {
          return h('span', { style: styles.chatBarGroup },
            h('span', { 'aria-hidden': true, style: { color: tone, fontSize: 9, lineHeight: 1 } }, '●'),
            h('span', { style: styles.chatText }, `${t('chatRollingShort')} ${percent}%`))
        }
        if (style === 'ring') {
          const radius = 5
          const circumference = 2 * Math.PI * radius
          return h('span', { style: styles.chatBarGroup },
            h('svg', { width: 14, height: 14, viewBox: '0 0 14 14', 'aria-hidden': true },
              h('circle', {
                cx: 7, cy: 7, r: radius, fill: 'none',
                stroke: 'var(--dsw-alias-bg-skeleton)', strokeWidth: 2.5,
              }),
              h('circle', {
                cx: 7, cy: 7, r: radius, fill: 'none',
                stroke: tone, strokeWidth: 2.5, strokeLinecap: 'round',
                strokeDasharray: `${circumference * percent / 100} ${circumference}`,
                transform: 'rotate(-90 7 7)',
              })),
            h('span', { style: styles.chatText }, `${percent}%`))
        }
        return h('span', { style: styles.chatBarGroup },
          h('span', { style: { ...styles.chatBarTrack, width: 36, flex: '0 0 36px' } },
            h('span', { style: { ...styles.chatBarFill, width: `${percent}%`, background: tone } })),
          h('span', { style: styles.chatText }, `${percent}%`))
      }
      return h(React.Fragment, null,
        style === 'badge' ? h('span', { 'aria-hidden': true, style: { color: 'var(--dsw-alias-state-business-primary)' } }, '●') : null,
        h('span', { style: styles.chatText }, text))
    }

    function ChatQuotaPill(props) {
      const directory = props.directory
      const model = React.useSyncExternalStore(
        listener => directory.subscribe(listener),
        () => directory.getSnapshot(),
        () => directory.getSnapshot(),
      )
      const form = props.form
      const config = React.useSyncExternalStore(
        listener => form.subscribe(listener),
        () => form.getSnapshot(),
        () => form.getSnapshot(),
      )
      if (config.status !== 'ready' || config.value?.showChatQuota === false
        || model.current?.provider !== 'kimi-coding') return null
      return h(ChatQuotaSurface, {
        ...props,
        contextKey: JSON.stringify([config.value?.usageEndpoint, config.value?.apiKeyEnv]),
        pillStyle: config.value?.chatQuotaStyle ?? 'badge',
        pillBorder: config.value?.chatQuotaBorder !== false,
      })
    }

    function ChatQuotaSurface(props) {
      const { t } = props
      const [state, setState] = React.useState({ usage: null, error: null, refreshing: false })
      const [open, setOpen] = React.useState(false)
      const root = React.useRef(null)
      const trigger = React.useRef(null)
      const refreshButton = React.useRef(null)
      const retry = React.useRef(() => {})
      React.useEffect(() => {
        let alive = true
        let busy = false
        let activeController
        setState({ usage: null, error: null, refreshing: false })
        const refresh = async (manual = false) => {
          if (busy || (!manual && document.visibilityState === 'hidden')) return
          busy = true
          const controller = new AbortController()
          activeController = controller
          const timeout = setTimeout(() => controller.abort(), 30_000)
          setState(previous => ({ ...previous, refreshing: true }))
          try {
            const usage = await props.usage(manual, controller.signal)
            if (alive) setState({ usage, error: null, refreshing: false })
          } catch (error) {
            if (alive) setState(previous => ({
              ...previous,
              refreshing: false,
              error: controller.signal.aborted ? t('quotaTimeout') : error instanceof Error ? error.message : String(error),
            }))
          } finally {
            clearTimeout(timeout)
            if (activeController === controller) activeController = undefined
            busy = false
            if (alive) setState(previous => ({ ...previous, refreshing: false }))
          }
        }
        retry.current = () => { void refresh(true) }
        void refresh()
        const timer = setInterval(() => { void refresh() }, 60_000)
        const visible = () => { if (document.visibilityState !== 'hidden') void refresh() }
        document.addEventListener('visibilitychange', visible)
        return () => {
          alive = false
          activeController?.abort()
          retry.current = () => {}
          clearInterval(timer)
          document.removeEventListener('visibilitychange', visible)
        }
      }, [props.usage, props.contextKey])
      React.useEffect(() => {
        if (!open) return undefined
        refreshButton.current?.querySelector('button')?.focus()
        const click = (event) => {
          if (!root.current?.contains(event.target)) setOpen(false)
        }
        const key = (event) => {
          if (event.key === 'Escape') {
            setOpen(false)
            trigger.current?.focus()
          }
        }
        document.addEventListener('mousedown', click)
        document.addEventListener('keydown', key)
        return () => {
          document.removeEventListener('mousedown', click)
          document.removeEventListener('keydown', key)
        }
      }, [open])
      const usage = state.usage
      const rolling = usage ? `${Math.round(usage.rolling.usedPercent)}%` : null
      const weekly = usage ? `${Math.round(usage.weekly.usedPercent)}%` : null
      const label = usage
        ? `${t('chatRollingShort')} ${rolling} · ${t('chatWeeklyShort')} ${weekly}${state.error ? ' · *' : ''}`
        : state.error ? t('chatUnavailable') : t('chatLoading')
      const fullLabel = `${t('quota')}: ${label}`
      const triggerStyle = props.pillStyle === 'plain' || props.pillBorder === false ? styles.chatTriggerPlain : styles.chatTrigger
      return h('div', { ref: root, style: styles.chatRoot },
        h('button', {
          ref: trigger, type: 'button', style: triggerStyle,
          'aria-label': fullLabel, title: state.error ?? fullLabel,
          'aria-expanded': open, 'aria-haspopup': 'dialog',
          onClick: () => setOpen(previous => !previous),
        }, h(ChatQuotaTriggerContent, { t, style: props.pillStyle, usage, label, stale: Boolean(state.error) })),
        open ? h('div', {
          style: styles.chatPanel, role: 'dialog', 'aria-label': t('quota'), 'aria-busy': state.refreshing,
        },
        h('div', { style: styles.chatHeading },
          h('strong', { style: { fontSize: 13 } }, t('quota')),
          h('span', { ref: refreshButton },
            h(Button, { type: 'button', disabled: state.refreshing, onClick: () => retry.current() },
              t(state.refreshing ? 'refreshingQuota' : 'refreshQuota')))),
        state.error ? h('div', { role: 'alert', style: styles.error }, `${t('operationFailed')}: ${state.error}`) : null,
        state.error && usage ? h('div', { style: styles.hint }, t('staleResult')) : null,
        usage ? h('div', { style: { display: 'grid', gap: 12 } },
          h(QuotaWindow, {
            t, label: t('rollingQuota'), value: usage.rolling, getLocale: props.getLocale,
            spark: usage.trend?.rolling, exhaustionHours: usage.trend?.rollingHoursToExhaustion,
          }),
          h(QuotaWindow, {
            t, label: t('weeklyQuota'), value: usage.weekly, getLocale: props.getLocale,
            spark: usage.trend?.weekly, exhaustionHours: usage.trend?.weeklyHoursToExhaustion,
          }),
          h('div', { style: styles.footer }, `${t('checkedAt')}: ${new Date(usage.checkedAt).toLocaleString(props.getLocale?.())}`)) : null) : null)
    }

    function KimiCodingSettings(props) {
      return h('div', { style: styles.page },
        h(QuotaPanel, props),
        h(SyncPanel, props),
        h(ModelSettingsPanel, props),
        h(SettingsPanel, props))
    }

    return {
      inject: ['slots', 'locale', 'remote', 'configForms'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'kimi-coding-models: dictionaries')
        const ready = ctx.remote.$mount(REMOTE)
        ctx.effect(async () => { await ready }, 'kimi-coding-models: remote')
        // A custom Remote namespace must be injected on a child Context after
        // $mount; reading it through this parent ctx throws "without inject".
        ctx.inject(['configForms', 'remote.kimiCodingModels'], (remoteCtx) => {
          const form = remoteCtx.configForms.get(ENTRY)
          const call = async (method, ...args) => {
            await ready
            const result = await remoteCtx.remote.kimiCodingModels[method](...args)
            if (!result.ok) throw result.error
            return result.value
          }
          const check = signal => call('read', signal)
          const sync = (confirmation, signal) => call('sync', true, confirmation, signal)
          const usage = (force, signal) => call('usage', force, signal)
          const models = () => call('models')
          const saveModels = (input) => call('saveModels', input)
          const injected = () => ({
            form,
            t: remoteCtx.locale.bind(NS),
            getLocale: () => remoteCtx.locale.getLocale().active,
            check,
            sync,
            usage,
            models,
            saveModels,
          })
          remoteCtx.effect(() => remoteCtx.configForms.whileServed([ENTRY], () => remoteCtx.slots.inject('settings.section', () => remoteCtx.slots.register({
            name: 'settings.section', id: ENTRY, order: 65, locale: NS,
            label: () => remoteCtx.locale.bind(NS)('nav'), inject: injected,
          }, KimiCodingSettings))), 'kimi-coding-models: settings section')
          remoteCtx.effect(() => remoteCtx.configForms.whileServed([ENTRY], () => remoteCtx.slots.inject('settings.section.icon', () => remoteCtx.slots.register({
            name: 'settings.section.icon', id: ENTRY, order: 65, locale: NS,
          }, SectionIcon))), 'kimi-coding-models: settings icon')
          // Match the model-aware composer integration used by OpenCode Go.
          remoteCtx.inject(['modelDirectories', 'sessions', 'remote.session'], (scope) => {
            scope.slots.inject('conversation.input.right', () => scope.slots.register({
              name: 'conversation.input.right', id: 'kimi-coding-usage', order: 900, locale: NS,
              inject: sessionId => ({
                ...injected(),
                directory: scope.modelDirectories.directoryFor(sessionId).store,
              }),
            }, ChatQuotaPill))
          })
        })
      },
    }
  },
})
