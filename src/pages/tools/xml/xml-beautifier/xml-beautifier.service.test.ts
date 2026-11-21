import { expect, describe, it } from 'vitest';
import { beautifyXml } from './service';

describe('xml-beautifier', () => {
  it('beautifies valid XML', () => {
    const input = '<root><a>1</a><b>2</b></root>';
    const result = beautifyXml(input, {});
    expect(result).toContain('<root>');
    expect(result).toContain('  <a>1</a>');
    expect(result).toContain('  <b>2</b>');
  });

  it('returns error for invalid XML', () => {
    const input = '<root><a>1</b></root>';
    const result = beautifyXml(input, {});
    expect(result).toMatch(/Invalid XML/i);
  });

  // CVE-2026-25896 (GHSA-m7jm-9gc2-mpf2, OMNI-4): before fast-xml-parser 5.3.5
  // a DOCTYPE entity name was put into a RegExp unescaped, so the entity "l."
  // also matched "&lt;" and replaced it, i.e. a document could override the
  // built-in entities. On 5.2.5 this input beautified to "a PWNED b".
  it('does not let a DOCTYPE entity name hijack a built-in entity', () => {
    const input =
      '<?xml version="1.0"?><!DOCTYPE r [<!ENTITY l. "PWNED">]><r>a &lt; b</r>';
    const result = beautifyXml(input, {});
    expect(result).toContain('<r>a &lt; b</r>');
    expect(result).not.toContain('PWNED');
  });
});
