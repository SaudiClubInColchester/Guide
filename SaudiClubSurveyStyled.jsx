import React, { useState, useEffect } from 'react';

export default function SaudiClubSurvey() {
  const [view, setView] = useState('survey');
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    studyLevel: '',
    hasFamily: '',
    activities: [],
    eventFrequency: '',
    preferredTime: [],
    expectations: [],
    communication: [],
    volunteer: '',
    suggestions: '',
    contactInfo: ''
  });

  const ADMIN_PASSWORD = 'club2024';

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      const result = await window.storage.get('survey-responses-v2', true);
      if (result && result.value) {
        setResponses(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No previous responses found');
    }
  };

  const saveResponse = async (newResponse) => {
    try {
      const updatedResponses = [...responses, newResponse];
      await window.storage.set('survey-responses-v2', JSON.stringify(updatedResponses), true);
      setResponses(updatedResponses);
      return true;
    } catch (error) {
      console.error('Error saving response:', error);
      return false;
    }
  };

  const handleCheckbox = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.gender || !formData.age || !formData.studyLevel) {
      alert('الرجاء إكمال المعلومات الشخصية الأساسية (الجنس، العمر، المرحلة الدراسية)');
      return;
    }

    setIsLoading(true);
    
    const response = {
      ...formData,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    const success = await saveResponse(response);
    
    setIsLoading(false);

    if (success) {
      setView('thanks');
      setFormData({
        gender: '',
        age: '',
        studyLevel: '',
        hasFamily: '',
        activities: [],
        eventFrequency: '',
        preferredTime: [],
        expectations: [],
        communication: [],
        volunteer: '',
        suggestions: '',
        contactInfo: ''
      });
    } else {
      alert('حدث خطأ في حفظ الإجابة. الرجاء المحاولة مرة أخرى.');
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setView('admin');
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  const exportToCSV = () => {
    if (responses.length === 0) {
      alert('لا توجد إجابات للتصدير');
      return;
    }

    const headers = ['التاريخ', 'الجنس', 'العمر', 'المرحلة الدراسية', 'عائلة', 'الأنشطة', 'تكرار الفعاليات', 'الأوقات المفضلة', 'التوقعات', 'التواصل', 'التطوع', 'الاقتراحات', 'معلومات التواصل'];
    
    const csvContent = [
      headers.join(','),
      ...responses.map(r => [
        new Date(r.timestamp).toLocaleDateString('ar-SA'),
        r.gender,
        r.age,
        r.studyLevel,
        r.hasFamily,
        `"${r.activities.join('، ')}"`,
        r.eventFrequency,
        `"${r.preferredTime.join('، ')}"`,
        `"${r.expectations.join('، ')}"`,
        `"${r.communication.join('، ')}"`,
        r.volunteer,
        `"${r.suggestions}"`,
        r.contactInfo
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `survey-responses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const clearAllResponses = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع الإجابات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        await window.storage.delete('survey-responses-v2', true);
        setResponses([]);
        alert('تم حذف جميع الإجابات');
      } catch (error) {
        alert('حدث خطأ في الحذف');
      }
    }
  };

  // الألوان والتصميم المطابق للدليل
  const styles = {
    colors: {
      primaryColor: '#1a472a',
      secondaryColor: '#2d5a3d',
      accentColor: '#c9a227',
      gold: '#d4af37',
      darkBg: '#0f2818',
      cardBg: '#163020',
      textPrimary: '#ffffff',
      textSecondary: '#a8b5a0',
      borderColor: '#2d5a3d',
    }
  };

  // صفحة الشكر
  if (view === 'thanks') {
    return (
      <div dir="rtl" style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${styles.colors.darkBg} 0%, #0a1f12 100%)`,
        fontFamily: 'Tajawal, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={{
          background: styles.colors.cardBg,
          borderRadius: '15px',
          padding: '3rem 2rem',
          textAlign: 'center',
          maxWidth: '500px',
          border: `2px solid ${styles.colors.accentColor}`,
          boxShadow: `0 0 40px rgba(201, 162, 39, 0.2)`
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: styles.colors.accentColor, fontSize: '1.8rem', marginBottom: '1rem' }}>شكراً لمشاركتك!</h2>
          <p style={{ color: styles.colors.textSecondary, fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            تم حفظ إجاباتك بنجاح. نقدر وقتك ومساهمتك في تطوير النادي.
          </p>
          <button
            onClick={() => setView('survey')}
            style={{
              background: `linear-gradient(135deg, ${styles.colors.accentColor}, ${styles.colors.gold})`,
              color: styles.colors.darkBg,
              padding: '0.75rem 2rem',
              borderRadius: '10px',
              border: 'none',
              fontFamily: 'Tajawal, sans-serif',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            إرسال إجابة جديدة
          </button>
        </div>
      </div>
    );
  }

  // صفحة الإدارة
  if (view === 'admin') {
    if (!isAdmin) {
      return (
        <div dir="rtl" style={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${styles.colors.darkBg} 0%, #0a1f12 100%)`,
          fontFamily: 'Tajawal, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
          <div style={{
            background: styles.colors.cardBg,
            borderRadius: '15px',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            border: `1px solid ${styles.colors.borderColor}`
          }}>
            <h2 style={{ color: styles.colors.accentColor, textAlign: 'center', marginBottom: '1.5rem' }}>🔐 تسجيل دخول المشرف</h2>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="كلمة المرور"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: `2px solid ${styles.colors.borderColor}`,
                background: styles.colors.darkBg,
                color: styles.colors.textPrimary,
                fontFamily: 'Tajawal, sans-serif',
                fontSize: '1rem',
                marginBottom: '1rem',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={handleAdminLogin}
              style={{
                width: '100%',
                background: `linear-gradient(135deg, ${styles.colors.accentColor}, ${styles.colors.gold})`,
                color: styles.colors.darkBg,
                padding: '0.75rem',
                borderRadius: '10px',
                border: 'none',
                fontFamily: 'Tajawal, sans-serif',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                marginBottom: '0.75rem'
              }}
            >
              دخول
            </button>
            <button
              onClick={() => setView('survey')}
              style={{
                width: '100%',
                background: 'transparent',
                color: styles.colors.textSecondary,
                padding: '0.5rem',
                border: 'none',
                fontFamily: 'Tajawal, sans-serif',
                cursor: 'pointer'
              }}
            >
              العودة للاستبيان
            </button>
          </div>
        </div>
      );
    }

    return (
      <div dir="rtl" style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${styles.colors.darkBg} 0%, #0a1f12 100%)`,
        fontFamily: 'Tajawal, sans-serif',
        padding: '1rem'
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            background: styles.colors.cardBg,
            borderRadius: '15px',
            padding: '1.5rem',
            border: `1px solid ${styles.colors.borderColor}`,
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ color: styles.colors.accentColor, margin: 0 }}>📊 إدارة الإجابات</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={exportToCSV} style={{
                  background: '#2563eb',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontFamily: 'Tajawal, sans-serif',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>📥 تصدير CSV</button>
                <button onClick={clearAllResponses} style={{
                  background: '#dc2626',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontFamily: 'Tajawal, sans-serif',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>🗑️ حذف الكل</button>
                <button onClick={() => { setView('survey'); setIsAdmin(false); }} style={{
                  background: '#4b5563',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontFamily: 'Tajawal, sans-serif',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>العودة</button>
              </div>
            </div>
            <p style={{ color: styles.colors.textSecondary, marginTop: '0.75rem', marginBottom: 0 }}>
              إجمالي الإجابات: <span style={{ color: styles.colors.gold, fontWeight: '700' }}>{responses.length}</span>
            </p>
          </div>

          {/* الإجابات */}
          {responses.length === 0 ? (
            <div style={{
              background: styles.colors.cardBg,
              borderRadius: '15px',
              padding: '3rem',
              textAlign: 'center',
              border: `1px solid ${styles.colors.borderColor}`
            }}>
              <p style={{ color: styles.colors.textSecondary }}>لا توجد إجابات حتى الآن</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {responses.map((r, index) => (
                <div key={r.id} style={{
                  background: styles.colors.cardBg,
                  borderRadius: '15px',
                  padding: '1.25rem',
                  border: `1px solid ${styles.colors.borderColor}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ color: styles.colors.gold, fontWeight: '700' }}>إجابة #{index + 1}</span>
                    <span style={{ color: styles.colors.textSecondary, fontSize: '0.85rem' }}>
                      {new Date(r.timestamp).toLocaleString('ar-SA')}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <div><span style={{ color: styles.colors.textSecondary }}>الجنس: </span><span style={{ color: 'white' }}>{r.gender}</span></div>
                    <div><span style={{ color: styles.colors.textSecondary }}>العمر: </span><span style={{ color: 'white' }}>{r.age}</span></div>
                    <div><span style={{ color: styles.colors.textSecondary }}>المرحلة: </span><span style={{ color: 'white' }}>{r.studyLevel}</span></div>
                    <div><span style={{ color: styles.colors.textSecondary }}>عائلة: </span><span style={{ color: 'white' }}>{r.hasFamily || '-'}</span></div>
                    <div><span style={{ color: styles.colors.textSecondary }}>التطوع: </span><span style={{ color: 'white' }}>{r.volunteer || '-'}</span></div>
                    <div><span style={{ color: styles.colors.textSecondary }}>التكرار: </span><span style={{ color: 'white' }}>{r.eventFrequency || '-'}</span></div>
                  </div>
                  {r.activities.length > 0 && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                      <span style={{ color: styles.colors.textSecondary }}>الأنشطة: </span>
                      <span style={{ color: 'white' }}>{r.activities.join('، ')}</span>
                    </div>
                  )}
                  {r.suggestions && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ color: styles.colors.textSecondary }}>الاقتراحات: </span>
                      <span style={{ color: 'white' }}>{r.suggestions}</span>
                    </div>
                  )}
                  {r.contactInfo && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ color: styles.colors.textSecondary }}>التواصل: </span>
                      <span style={{ color: 'white' }}>{r.contactInfo}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // صفحة الاستبيان الرئيسية
  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: `2px solid ${styles.colors.borderColor}`,
    background: styles.colors.darkBg,
    color: styles.colors.textPrimary,
    fontFamily: 'Tajawal, sans-serif',
    fontSize: '1rem',
    boxSizing: 'border-box'
  };

  const checkboxItemStyle = (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: isSelected ? 'rgba(201, 162, 39, 0.1)' : styles.colors.darkBg,
    borderRadius: '10px',
    cursor: 'pointer',
    border: `1px solid ${isSelected ? styles.colors.accentColor : 'transparent'}`,
    transition: 'all 0.3s'
  });

  const radioItemStyle = (isSelected) => ({
    flex: 1,
    padding: '0.75rem 1rem',
    background: isSelected ? 'rgba(201, 162, 39, 0.1)' : styles.colors.darkBg,
    borderRadius: '10px',
    cursor: 'pointer',
    border: `1px solid ${isSelected ? styles.colors.accentColor : 'transparent'}`,
    textAlign: 'center',
    transition: 'all 0.3s'
  });

  return (
    <div dir="rtl" style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${styles.colors.darkBg} 0%, #0a1f12 100%)`,
      fontFamily: 'Tajawal, sans-serif',
      color: styles.colors.textPrimary,
      lineHeight: '1.8'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
      
      {/* Header with Logo */}
      <header style={{
        background: `linear-gradient(180deg, ${styles.colors.primaryColor} 0%, ${styles.colors.darkBg} 100%)`,
        padding: '2rem',
        textAlign: 'center',
        borderBottom: `2px solid ${styles.colors.accentColor}`
      }}>
        {/* Logo */}
        <div style={{
          width: '150px',
          height: '150px',
          margin: '0 auto 1.5rem',
          borderRadius: '50%',
          border: `4px solid ${styles.colors.accentColor}`,
          boxShadow: `0 0 40px rgba(201, 162, 39, 0.4)`,
          overflow: 'hidden',
          background: styles.colors.cardBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* ضع الشعار هنا */}
          <span style={{ fontSize: '4rem' }}>🇸🇦</span>
        </div>
        
        <h1 style={{ fontSize: '1.8rem', color: styles.colors.accentColor, marginBottom: '0.5rem' }}>
          استبيان النادي السعودي في كولشستر
        </h1>
        <p style={{ color: styles.colors.textSecondary, fontSize: '1.1rem', margin: 0 }}>
          نسعد بمعرفة آرائكم لتطوير أنشطة النادي
        </p>
        <button
          onClick={() => setView('admin')}
          style={{
            marginTop: '1rem',
            background: 'transparent',
            border: 'none',
            color: styles.colors.textSecondary,
            fontSize: '0.8rem',
            cursor: 'pointer',
            opacity: 0.6
          }}
        >
          🔐 دخول المشرف
        </button>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        {/* مقدمة */}
        <div style={{
          background: styles.colors.cardBg,
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: `1px solid ${styles.colors.borderColor}`,
          textAlign: 'center'
        }}>
          <p style={{ color: styles.colors.textSecondary, margin: 0 }}>
            نرجو منكم تخصيص بضع دقائق للإجابة على هذا الاستبيان. آراؤكم مهمة جداً لنا لتقديم أفضل الخدمات والفعاليات.
          </p>
        </div>

        {/* المعلومات الشخصية */}
        <div style={{
          background: styles.colors.cardBg,
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: `1px solid ${styles.colors.borderColor}`
        }}>
          <h2 style={{
            fontSize: '1.4rem',
            color: styles.colors.accentColor,
            marginBottom: '1.5rem',
            paddingBottom: '0.5rem',
            borderBottom: `2px solid ${styles.colors.accentColor}`
          }}>📋 المعلومات الشخصية</h2>

          {/* الجنس */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: styles.colors.gold, fontWeight: '700', marginBottom: '0.75rem' }}>
              الجنس <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['ذكر', 'أنثى'].map(option => (
                <label key={option} style={radioItemStyle(formData.gender === option)}>
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={formData.gender === option}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    style={{ display: 'none' }}
                  />
                  <span style={{ color: 'white' }}>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* العمر */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: styles.colors.gold, fontWeight: '700', marginBottom: '0.75rem' }}>
              الفئة العمرية <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <select
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              style={inputStyle}
            >
              <option value="">اختر الفئة العمرية</option>
              <option value="18-24">18 - 24 سنة</option>
              <option value="25-30">25 - 30 سنة</option>
              <option value="31-40">31 - 40 سنة</option>
              <option value="41+">41 سنة فأكثر</option>
            </select>
          </div>

          {/* المرحلة الدراسية */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: styles.colors.gold, fontWeight: '700', marginBottom: '0.75rem' }}>
              المرحلة الدراسية <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <select
              value={formData.studyLevel}
              onChange={(e) => setFormData({...formData, studyLevel: e.target.value})}
              style={inputStyle}
            >
              <option value="">اختر المرحلة الدراسية</option>
              <option value="لغة">لغة إنجليزية</option>
              <option value="تأسيسي">سنة تأسيسية</option>
              <option value="بكالوريوس">بكالوريوس</option>
              <option value="ماجستير">ماجستير</option>
              <option value="دكتوراه">دكتوراه</option>
              <option value="مرافق">مرافق/مرافقة</option>
            </select>
          </div>

          {/* العائلة */}
          <div>
            <label style={{ display: 'block', color: styles.colors.gold, fontWeight: '700', marginBottom: '0.75rem' }}>
              هل معك عائلة في كولشستر؟
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['نعم', 'لا'].map(option => (
                <label key={option} style={radioItemStyle(formData.hasFamily === option)}>
                  <input
                    type="radio"
                    name="hasFamily"
                    value={option}
                    checked={formData.hasFamily === option}
                    onChange={(e) => setFormData({...formData, hasFamily: e.target.value})}
                    style={{ display: 'none' }}
                  />
                  <span style={{ color: 'white' }}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* الأنشطة المفضلة */}
        <div style={{
          background: styles.colors.cardBg,
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: `1px solid ${styles.colors.borderColor}`
        }}>
          <h2 style={{
            fontSize: '1.4rem',
            color: styles.colors.accentColor,
            marginBottom: '1.5rem',
            paddingBottom: '0.5rem',
            borderBottom: `2px solid ${styles.colors.accentColor}`
          }}>🎯 الأنشطة المفضلة</h2>

          <label style={{ display: 'block', color: styles.colors.gold, fontWeight: '700', marginBottom: '0.75rem' }}>
            ما هي الأنشطة التي تود أن يقدمها النادي؟ (اختر كل ما يناسبك)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['أنشطة ثقافية (احتفالات وطنية، أمسيات أدبية)', 'أنشطة رياضية (كرة قدم، سباحة، مشي)', 'أنشطة اجتماعية (لقاءات تعارف، حفلات استقبال)', 'محاضرات وورش عمل', 'رحلات ترفيهية', 'فعاليات عائلية', 'أنشطة دينية'].map(activity => (
              <label key={activity} style={checkboxItemStyle(formData.activities.includes(activity))}>
                <input
                  type="checkbox"
                  checked={formData.activities.includes(activity)}
                  onChange={() => handleCheckbox('activities', activity)}
                  style={{ width: '20px', height: '20px', accentColor: styles.colors.accentColor }}
                />
                <span style={{ color: styles.colors.textSecondary }}>{activity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* التفضيلات */}
        <div style={{
          background: styles.colors.cardBg,
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: `1px solid ${styles.colors.borderColor}`
        }}>
          <h2 style={{
            fontSize: '1.4rem',
            color: styles.colors.accentColor,
            marginBottom: '1.5rem',
            paddingBottom: '0.5rem',
            borderBottom: `2px solid ${styles.colors.accentColor}`
          }}>⏰ التفضيلات</h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: styles.colors.gold, fontWeight: '700', marginBottom: '0.75rem' }}>
              كم مرة تفضل إقامة الفعاليات؟
            </label>
            <select
              value={formData.eventFrequency}
              onChange={(e) => setFormData({...formData, eventFrequency: e.target.value})}
              style={inputStyle}
            >
              <option value="">اختر التكرار</option>
              <option value="أسبوعياً">أسبوعياً</option>
              <option value="كل أسبوعين">كل أسبوعين</option>
              <option value="شهرياً">شهرياً</option>
              <option value="كل ثلاثة أشهر">كل ثلاثة أشهر</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: styles.colors.gold, fontWeight: '700', marginBottom: '0.75rem' }}>
              الأوقات المفضلة لإقامة الفعاليات:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['نهاية الأسبوع (السبت والأحد)', 'أيام الأسبوع مساءً', 'أيام الأسبوع نهاراً'].map(time => (
                <label key={time} style={checkboxItemStyle(formData.preferredTime.includes(time))}>
                  <input
                    type="checkbox"
                    checked={formData.preferredTime.includes(time)}
                    onChange={() => handleCheckbox('preferredTime', time)}
                    style={{ width: '20px', height: '20px', accentColor: styles.colors.accentColor }}
                  />
                  <span style={{ color: styles.colors.textSecondary }}>{time}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* التوقعات */}
        <div style={{
          background: styles.colors.cardBg,
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: `1px solid ${styles.colors.borderColor}`
        }}>
          <h2 style={{
            fontSize: '1.4rem',
            color: styles.colors.accentColor,
            marginBottom: '1.5rem',
            paddingBottom: '0.5rem',
            borderBottom: `2px solid ${styles.colors.accentColor}`
          }}>🎯 التوقعات من النادي</h2>

          <label style={{ display: 'block', color: styles.colors.gold, fontWeight: '700', marginBottom: '0.75rem' }}>
            ما هي توقعاتك من النادي السعودي؟ (اختر كل ما يناسبك)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['توفير بيئة اجتماعية داعمة', 'تنظيم فعاليات منتظمة', 'المساعدة في التأقلم مع الحياة في بريطانيا', 'ربط الطلاب ببعضهم البعض', 'تقديم الدعم الإداري والاستشاري', 'الحفاظ على الهوية الثقافية السعودية', 'توفير معلومات عن الخدمات المحلية'].map(exp => (
              <label key={exp} style={checkboxItemStyle(formData.expectations.includes(exp))}>
                <input
                  type="checkbox"
                  checked={formData.expectations.includes(exp)}
                  onChange={() => handleCheckbox('expectations', exp)}
                  style={{ width: '20px', height: '20px', accentColor: styles.colors.accentColor }}
                />
                <span style={{ color: styles.colors.textSecondary }}>{exp}</span>
              </label>
            ))}
          </div>
        </div>

        {/* التواصل */}
        <div style={{
          background: styles.colors.cardBg,
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: `1px solid ${styles.colors.borderColor}`
        }}>
          <h2 style={{
            fontSize: '1.4rem',
            color: styles.colors.accentColor,
            marginBottom: '1.5rem',
            paddingBottom: '0.5rem',
            borderBottom: `2px solid ${styles.colors.accentColor}`
          }}>📱 التواصل</h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: styles.colors.gold, fontWeight: '700', marginBottom: '0.75rem' }}>
              طرق التواصل المفضلة:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['مجموعات واتساب', 'حسابات وسائل التواصل الاجتماعي', 'البريد الإلكتروني', 'موقع إلكتروني للنادي'].map(method => (
                <label key={method} style={checkboxItemStyle(formData.communication.includes(method))}>
                  <input
                    type="checkbox"
                    checked={formData.communication.includes(method)}
                    onChange={() => handleCheckbox('communication', method)}
                    style={{ width: '20px', height: '20px', accentColor: styles.colors.accentColor }}
                  />
                  <span style={{ color: styles.colors.textSecondary }}>{method}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: styles.colors.gold, fontWeight: '700', marginBottom: '0.75rem' }}>
              هل أنت مهتم بالتطوع في تنظيم الفعاليات؟
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['نعم، أود المشاركة', 'ربما في المستقبل', 'لا، أفضل الحضور فقط'].map(option => (
                <label key={option} style={checkboxItemStyle(formData.volunteer === option)}>
                  <input
                    type="radio"
                    name="volunteer"
                    value={option}
                    checked={formData.volunteer === option}
                    onChange={(e) => setFormData({...formData, volunteer: e.target.value})}
                    style={{ display: 'none' }}
                  />
                  <span style={{ color: styles.colors.textSecondary }}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* الاقتراحات */}
        <div style={{
          background: styles.colors.cardBg,
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: `1px solid ${styles.colors.borderColor}`
        }}>
          <h2 style={{
            fontSize: '1.4rem',
            color: styles.colors.accentColor,
            marginBottom: '1.5rem',
            paddingBottom: '0.5rem',
            borderBottom: `2px solid ${styles.colors.accentColor}`
          }}>💡 الاقتراحات</h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: styles.colors.gold, fontWeight: '700', marginBottom: '0.75rem' }}>
              هل لديك أي اقتراحات أو أفكار لتطوير النادي؟
            </label>
            <textarea
              value={formData.suggestions}
              onChange={(e) => setFormData({...formData, suggestions: e.target.value})}
              placeholder="شاركنا أفكارك واقتراحاتك..."
              style={{
                ...inputStyle,
                minHeight: '120px',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: styles.colors.gold, fontWeight: '700', marginBottom: '0.75rem' }}>
              معلومات التواصل (اختياري)
            </label>
            <input
              type="text"
              value={formData.contactInfo}
              onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
              placeholder="البريد الإلكتروني أو رقم الواتساب"
              style={inputStyle}
            />
          </div>
        </div>

        {/* زر الإرسال */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '1rem 2rem',
            background: `linear-gradient(135deg, ${styles.colors.accentColor}, ${styles.colors.gold})`,
            color: styles.colors.darkBg,
            border: 'none',
            borderRadius: '10px',
            fontFamily: 'Tajawal, sans-serif',
            fontSize: '1.2rem',
            fontWeight: '700',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            marginTop: '0.5rem'
          }}
        >
          {isLoading ? '⏳ جاري الإرسال...' : '✉️ إرسال الاستبيان'}
        </button>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '2rem', color: styles.colors.textSecondary }}>
          <p>شكراً لوقتك ومشاركتك معنا 🇸🇦</p>
          <p style={{ color: styles.colors.accentColor }}>النادي السعودي في كولشستر</p>
        </div>
      </div>
    </div>
  );
}
