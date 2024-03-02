import Link from 'quill/formats/link';

Link.PROTOCOL_WHITELIST = [
  'http',
  'https',
  'mailto',
  'tel',
  'radar',
  'rdar',
  'smb',
  'sms',
];

class CustomLink extends Link {
  static sanitize(url) {
    // Run default sanitize method from Quill
    const sanitizedUrl = super.sanitize(url);

    // Not whitelisted URL based on protocol so, let's return `blank`
    if (!sanitizedUrl || sanitizedUrl === 'about:blank') return sanitizedUrl;

    // Verify if the URL already have a whitelisted protocol
    const hasWhitelistedProtocol = this.PROTOCOL_WHITELIST.some(function (
      protocol
    ) {
      return sanitizedUrl.startsWith(protocol);
    });

    if (hasWhitelistedProtocol) return sanitizedUrl;

    // if not, then append only 'http' to not to be a relative URL
    return `https://${sanitizedUrl}`;
  }
}

export default CustomLink;
