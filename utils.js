export function findRule(rules, ruleName) {
  return rules?.find((rule) => rule.name === ruleName);
}

export function hasFlag(flags, flagName, flagValue) {
  if (flags !== undefined) {
    return Object.entries(flags).some(([name, value]) => flagName === name && flagValue === value);
  }
  return false;
}
