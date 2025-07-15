import crypto from 'crypto';

export interface VolcengineCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  service: string;
}

export class VolcengineAuth {
  private credentials: VolcengineCredentials;

  constructor(credentials: VolcengineCredentials) {
    this.credentials = credentials;
  }

  private sha256(data: string): string {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  }

  private hmacSha256(key: string | Buffer, data: string): Buffer {
    return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
  }

  private getCanonicalHeaders(headers: Record<string, string>): string {
    const sortedHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key].trim()}\n`)
      .join('');
    return sortedHeaders;
  }

  private getSignedHeaders(headers: Record<string, string>): string {
    return Object.keys(headers).sort().map(key => key.toLowerCase()).join(';');
  }

  public signRequest(
    method: string,
    uri: string,
    query: string,
    headers: Record<string, string>,
    payload: string,
    timestamp: string
  ): string {
    const payloadHash = this.sha256(payload);
    headers['x-content-sha256'] = payloadHash;

    const canonicalRequest = [
      method,
      uri,
      query,
      this.getCanonicalHeaders(headers),
      this.getSignedHeaders(headers),
      payloadHash
    ].join('\n');

    const algorithm = 'HMAC-SHA256';
    const credentialScope = `${timestamp.substr(0, 8)}/${this.credentials.region}/${this.credentials.service}/request`;
    const stringToSign = [
      algorithm,
      timestamp,
      credentialScope,
      this.sha256(canonicalRequest)
    ].join('\n');

    const kDate = this.hmacSha256(this.credentials.secretAccessKey, timestamp.substr(0, 8));
    const kRegion = this.hmacSha256(kDate, this.credentials.region);
    const kService = this.hmacSha256(kRegion, this.credentials.service);
    const kSigning = this.hmacSha256(kService, 'request');

    const signature = this.hmacSha256(kSigning, stringToSign).toString('hex');

    return `${algorithm} Credential=${this.credentials.accessKeyId}/${credentialScope}, SignedHeaders=${this.getSignedHeaders(headers)}, Signature=${signature}`;
  }
}