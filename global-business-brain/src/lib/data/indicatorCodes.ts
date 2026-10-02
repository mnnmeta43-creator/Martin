/**
 * Internal indicator codes tracked by the app (contract between the data layer and the idea library).
 * `src/lib/data/indicators.ts` must define exactly one IndicatorDefinition per code below.
 * Source codes are given for reference; the definition file is the source of truth.
 */
export const INDICATOR_CODES = [
  'gdp_growth', // WB NY.GDP.MKTP.KD.ZG
  'gdp_per_capita_usd', // WB NY.GDP.PCAP.CD
  'gdp_per_capita_ppp', // WB NY.GDP.PCAP.PP.CD
  'household_consumption_growth', // WB NE.CON.PRVT.KD.ZG
  'inflation_cpi', // WB FP.CPI.TOTL.ZG
  'price_level_ratio', // WB PA.NUS.PPPC.RF
  'lending_rate', // WB FR.INR.LEND
  'real_interest_rate', // WB FR.INR.RINR
  'private_credit_gdp', // WB FS.AST.PRVT.GD.ZS
  'account_ownership', // WB FX.OWN.TOTL.ZS (Global Findex, irregular)
  'unemployment', // WB SL.UEM.TOTL.ZS (ILO modelled estimate)
  'youth_unemployment', // WB SL.UEM.1524.ZS
  'labor_participation', // WB SL.TLF.CACT.ZS
  'population', // WB SP.POP.TOTL
  'population_growth', // WB SP.POP.GROW
  'urban_population_pct', // WB SP.URB.TOTL.IN.ZS
  'urban_population_growth', // WB SP.URB.GROW
  'population_65_plus_pct', // WB SP.POP.65UP.TO.ZS
  'population_0_14_pct', // WB SP.POP.0014.TO.ZS
  'exchange_rate_lcu_usd', // WB PA.NUS.FCRF
  'imports_gdp', // WB NE.IMP.GNFS.ZS
  'exports_gdp', // WB NE.EXP.GNFS.ZS
  'agriculture_va_gdp', // WB NV.AGR.TOTL.ZS
  'industry_va_gdp', // WB NV.IND.TOTL.ZS
  'manufacturing_va_gdp', // WB NV.IND.MANF.ZS
  'services_va_gdp', // WB NV.SRV.TOTL.ZS
  'remittances_gdp', // WB BX.TRF.PWKR.DT.GD.ZS
  'tourism_arrivals', // WB ST.INT.ARVL
  'tourism_receipts_usd', // WB ST.INT.RCPT.CD
  'internet_users_pct', // WB IT.NET.USER.ZS
  'mobile_subscriptions', // WB IT.CEL.SETS.P2
  'electricity_access', // WB EG.ELC.ACCS.ZS
  'new_business_density', // WB IC.BUS.NDNS.ZS
  'imf_gdp_growth', // IMF DataMapper NGDP_RPCH (WEO; future years are projections)
  'imf_inflation', // IMF DataMapper PCPIPCH
  'imf_unemployment', // IMF DataMapper LUR
] as const;

export type IndicatorCode = (typeof INDICATOR_CODES)[number];

export const INDICATOR_CODE_SET: ReadonlySet<string> = new Set(INDICATOR_CODES);
