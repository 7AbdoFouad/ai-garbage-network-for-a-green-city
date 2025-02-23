import React, { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box, Typography, List, ListItem } from '@mui/material';
import * as tf from '@tensorflow/tfjs';

// دالة تحليل النصوص (محاكاة تحليل بسيط للأولوية)
const processText = (text) => {
  return tf.tidy(() => {
    const lengthScore = text.length > 20 ? 'High' : 'Low'; // تحليل بسيط لطول النص
    return lengthScore;
  });
};

// قائمة أسباب رفض البلاغ
const rejectionReasons = [
  "عدم وجود مشكلة فعلية — تم حلها بالفعل أو لم تكن موجودة",
  "نقص المعلومات — البلاغ يفتقر إلى التفاصيل الضرورية، مثل الموقع الدقيق أو وصف المشكلة",
  "بلاغ غير صحيح أو مضلل — معلومات خاطئة أو مضللة، مثل الإبلاغ عن صندوق نفايات غير موجود",
  "تكرار البلاغات — بلاغات متعددة لنفس المشكلة من قبل نفس المستخدم أو من مستخدمين آخرين",
  "أولوية البلاغات — نقص في الموارد، مثل عدم القدرة على معالجة البلاغات في الوقت الحالي"
];

// مكون تصفية البلاغات
function FilterReports({ type, setType, date, setDate, status, setStatus }) {
  return (
    <Box display="flex" gap={2} marginBottom={3} flexWrap="wrap">
      {/* نوع البلاغ */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", marginBottom: 1 }}>
          نوع البلاغ
        </Typography>
        <FormControl sx={{ minWidth: 180, bgcolor: "#fff", borderRadius: 2, boxShadow: 1 }}>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <MenuItem value="full_bin">امتلاء صندوق</MenuItem>
            <MenuItem value="broken_bin">تلف صندوق</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ترتيب حسب */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", marginBottom: 1 }}>
          ترتيب حسب
        </Typography>
        <FormControl sx={{ minWidth: 180, bgcolor: "#fff", borderRadius: 2, boxShadow: 1 }}>
          <Select value={date} onChange={(e) => setDate(e.target.value)}>
            <MenuItem value="newest">من الأحدث للأقدم</MenuItem>
            <MenuItem value="oldest">من الأقدم للأحدث</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* حالة البلاغ */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", marginBottom: 1 }}>
          حالة البلاغ
        </Typography>
        <FormControl sx={{ minWidth: 180, bgcolor: "#fff", borderRadius: 2, boxShadow: 1 }}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="completed">مُكتمل</MenuItem>
            <MenuItem value="in_process">قيد المعالجة</MenuItem>
            <MenuItem value="new">جديد</MenuItem>
            <MenuItem value="rejected">مرفوض</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

// مكون إدارة البلاغات
export default function ManageReports() {
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState('');

  // دالة تحليل تقرير المستخدم (يتم تنفيذها عند تغيير البلاغ)
  const handleReport = (reportText) => {
    const priority = processText(reportText);
    console.log(`Priority: ${priority}`);
  };

  return (
    <Box 
      padding={4} 
      sx={{ 
        bgcolor: "#e8f5e9", // خلفية خضراء فاتحة
        minHeight: "100vh",
        display: "flex", 
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      {/* عنوان الصفحة */}
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#2e7d32", marginBottom: 3 }}>
        إدارة البلاغات
      </Typography>

      {/* فلاتر البلاغات */}
      <FilterReports type={type} setType={setType} date={date} setDate={setDate} status={status} setStatus={setStatus} />
      
      {/* قائمة إدارة البلاغ */}
      <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", marginBottom: 1, marginTop: 2 }}>
        إدارة البلاغ
      </Typography>
      <FormControl sx={{ minWidth: 200, bgcolor: "#fff", borderRadius: 2, boxShadow: 2 }}>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <MenuItem value="new">جديد</MenuItem>
          <MenuItem value="in_process">قيد المعالجة</MenuItem>
          <MenuItem value="processed">مُعالج</MenuItem>
          <MenuItem value="completed">مُكتمل</MenuItem>
          <MenuItem value="rejected">مرفوض</MenuItem>
        </Select>
      </FormControl>

      {/* عرض أسباب الرفض فقط إذا تم اختيار "مرفوض" */}
      {status === "rejected" && (
        <Box marginTop={3} sx={{ bgcolor: "#f8f8f8", padding: 2, borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#d32f2f", textAlign: "center" }}>
            ❌ أسباب رفض البلاغ
          </Typography>
          <List>
            {rejectionReasons.map((reason, index) => (
              <ListItem key={index} sx={{ color: "#333" }}>• {reason}</ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
