export const metadata = {
  title: 'Privacy Policy - ChatLima',
  description: 'Privacy Policy for using the ChatLima platform',
};

export default function PrivacyPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            
            <p className="text-gray-600 mb-8 italic">
              Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to ChatLima (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). 
                  This Privacy Policy explains how we collect, use, and protect your information when you use our website 
                  (https://chatlima.com) and services, including our AI-powered chat platform, APIs, and related features.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="text-gray-600">Email:</span>
                      <a href="mailto:getchatlima@gmail.com" className="text-blue-600 hover:text-blue-800">getchatlima@gmail.com</a>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-gray-600">Website:</span>
                      <a href="https://chatlima.com" className="text-blue-600 hover:text-blue-800">https://chatlima.com</a>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">Personal Information</h3>
                    <p className="text-gray-700 mb-3">
                      We may collect personal information that you voluntarily provide to us, including but not limited to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>Name and email address (for registered users)</li>
                      <li>Google OAuth account information (when using Google sign-in)</li>
                      <li>Billing and payment information (for premium features)</li>
                      <li>API keys you choose to provide for third-party services</li>
                      <li>Account credentials and preferences</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">Chat Content and Usage Data</h3>
                    <p className="text-gray-700 mb-3">
                      When you use our AI chat services, we collect:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>Chat messages and conversations</li>
                      <li>AI model responses and generated content</li>
                      <li>Uploaded images and files (processed for AI analysis)</li>
                      <li>Model preferences and settings</li>
                      <li>Usage patterns and feature interactions</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">Technical and Usage Data</h3>
                    <p className="text-gray-700 mb-3">
                      We automatically collect technical data when you visit our website, including:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>IP address and device information</li>
                      <li>Browser type and version</li>
                      <li>Pages visited and time spent</li>
                      <li>Error logs and performance metrics</li>
                      <li>Interaction with our services and features</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Provide and improve our AI chat services</li>
                  <li>Process your requests and generate AI responses</li>
                  <li>Manage your account and billing</li>
                  <li>Analyze usage patterns to enhance our platform</li>
                  <li>Ensure security and prevent abuse</li>
                  <li>Communicate with you about our services</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
                <p className="text-gray-700 mb-4">
                  Our platform integrates with third-party services that may collect and process your data 
                  according to their own privacy policies:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-3">
                    <li>
                      <span className="font-medium">AI Providers:</span>
                      <span className="text-gray-700"> OpenRouter, Requesty, OpenAI, Anthropic, Google, and other AI model providers for chat functionality</span>
                    </li>
                    <li>
                      <span className="font-medium">Authentication:</span>
                      <span className="text-gray-700"> Google OAuth for user authentication</span>
                    </li>
                    <li>
                      <span className="font-medium">Billing:</span>
                      <span className="text-gray-700"> Polar for payment processing and subscription management</span>
                    </li>
                    <li>
                      <span className="font-medium">Database:</span>
                      <span className="text-gray-700"> Neon for data storage and management</span>
                    </li>
                    <li>
                      <span className="font-medium">MCP Servers:</span>
                      <span className="text-gray-700"> Various MCP (Model Context Protocol) servers for extended functionality</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-700 mb-4">
                  We implement appropriate security measures to protect your personal information and chat content:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication and session management</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Access controls and data protection measures</li>
                  <li>Client-side processing for sensitive operations like image handling</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  However, no method of transmission over the Internet or electronic storage is 100% secure. 
                  We cannot guarantee absolute security of your data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
                <p className="text-gray-700 mb-4">
                  We retain your information for as long as necessary to provide our services:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Chat content is retained while your account is active</li>
                  <li>Account information is kept for billing and service purposes</li>
                  <li>Usage data may be retained for analytics and improvement</li>
                  <li>Data may be deleted upon account closure or upon request</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>
                <p className="text-gray-700 mb-4">
                  You have certain rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Access and review your personal data</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your data (subject to legal requirements)</li>
                  <li>Opt out of certain data processing activities</li>
                  <li>Export your chat data and account information</li>
                  <li>Control your privacy settings and preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Anonymous Usage</h2>
                <p className="text-gray-700">
                  We support anonymous usage of our platform with limited functionality. 
                  Anonymous users are subject to usage limits and may have restricted access to certain features. 
                  We still collect minimal technical data necessary for service operation and security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children&apos;s Privacy</h2>
                <p className="text-gray-700">
                  Our services are not intended for children under 13 years of age. 
                  We do not knowingly collect personal information from children under 13. 
                  If you are a parent or guardian and believe your child has provided us with personal information, 
                  please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes 
                  by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date. 
                  Your continued use of our services after such changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Acceptance</h2>
                <p className="text-gray-700">
                  By using our website and services, you signify your acceptance of this Privacy Policy. 
                  If you do not agree to this policy, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    If you have any questions about this Privacy Policy or our data practices, please contact us at:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="text-gray-600">Email:</span>
                      <a href="mailto:getchatlima@gmail.com" className="text-blue-600 hover:text-blue-800">getchatlima@gmail.com</a>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-gray-600">Website:</span>
                      <a href="https://chatlima.com" className="text-blue-600 hover:text-blue-800">https://chatlima.com</a>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 