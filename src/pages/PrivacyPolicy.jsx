export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-20 md:py-32">
      <h1 className="font-headline mb-8 text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
        Privacy Policy
      </h1>
      <div className="prose prose-slate max-w-none text-secondary">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p className="mt-6">
          At The Academic Curator, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our campus tour booking services.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-primary">Information We Collect</h2>
        <p className="mt-4">
          We may collect personal information that you provide to us when registering for an account, expressing an interest in obtaining information about us or our products and services, or otherwise contacting us.
        </p>
        <ul className="mt-4 list-disc pl-6">
          <li>Name and Contact Data (email address, phone number)</li>
          <li>Credentials (passwords, password hints)</li>
          <li>Payment Data (processed securely via our payment providers)</li>
        </ul>
        <p className="mt-8 italic text-sm">This is a placeholder page for The Academic Curator project.</p>
      </div>
    </div>
  )
}
