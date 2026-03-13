/**
 * Sample test to verify Jest is configured correctly
 */

describe('Jest Configuration Verification', () => {
  it('should execute a passing test', () => {
    expect(true).toBe(true);
  });

  it('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle string comparisons', () => {
    const message = 'Jest test framework is working';
    expect(message).toContain('Jest');
  });
});
