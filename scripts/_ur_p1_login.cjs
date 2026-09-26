/* Phase 1 batch — Login.tsx (English/Roman-Urdu → t()/L()) */
module.exports = {
  'src/components/Login.tsx': [
    { line: 90, find: "setError('Please fill in all fields.');", replace: "setError(t('login.errBoth'));" },
    { line: 106, find: "toast.success(`Welcome ${session.name}!`);", replace: "toast.success(L(`Welcome ${session.name}!`, `${session.name}، خوش آمدید!`));" },
    { line: 109, find: "setError('Aap ka account kisi staff/student profile se linked nahi hai. Principal se rabta karein.');", replace: "setError(L('Your account is not linked to a staff/student profile. Please contact the principal.', 'آپ کا اکاؤنٹ کسی اسٹاف/طالب علم پروفائل سے منسلک نہیں۔ پرنسپل سے رابطہ کریں۔'));" },
    { line: 119, find: "toast.success(`Welcome ${localSession.name}!`);", replace: "toast.success(L(`Welcome ${localSession.name}!`, `${localSession.name}، خوش آمدید!`));" },
    { line: 123, find: "setError('Invalid ID or Password. Portal access denied.');", replace: "setError(t('login.errWrong'));" },
    { line: 125, find: "setError(err?.message || 'Login failed. Please try again.');", replace: "setError(err?.message || L('Login failed. Please try again.', 'لاگ اِن ناکام ہو گئی — دوبارہ کوشش کریں۔'));" },
    { line: 145, find: 'Portal <span className="font-extrabold not-">Login</span>', replace: "{L('Portal', 'پورٹل')} <span className=\"font-extrabold not-\">{L('Login', 'لاگ اِن')}</span>" },
    { line: 169, find: 'placeholder="Login ID (e.g. teacher1)"', replace: "placeholder={t('login.username') + ' (e.g. teacher1)'}" },
    { line: 181, find: 'placeholder="Password"', replace: "placeholder={t('login.password')}" },
    { line: 201, find: "{busy ? 'Signing In...' : 'Sign In to Portal'}", replace: "{busy ? t('login.signing') : t('login.signin')}" },
    { line: 210, find: 'Return to Overview', replace: "{L('Return to Overview', 'اوور ویو پر واپس جائیں')}" },
    { line: 219, find: '{schoolName} Digital Management Infrastructure', replace: "{schoolName} {L('Digital Management Infrastructure', 'ڈیجیٹل مینجمنٹ انفراسٹرکچر')}" },
  ],
};