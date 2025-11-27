const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Export attendance records to CSV
const exportAttendanceCSV = async (records, filePath) => {
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'date', title: 'Date' },
      { id: 'memberName', title: 'Member Name' },
      { id: 'memberEmail', title: 'Member Email' },
      { id: 'trainerName', title: 'Trainer Name' },
      { id: 'method', title: 'Check-in Method' },
      { id: 'time', title: 'Check-in Time' },
    ],
  });

  const csvData = records.map((record) => ({
    date: record.checkinAt.toISOString().split('T')[0],
    memberName: record.memberId?.name || 'N/A',
    memberEmail: record.memberId?.email || 'N/A',
    trainerName: record.trainerId?.name || 'N/A',
    method: record.method,
    time: record.checkinAt.toISOString().split('T')[1].split('.')[0],
  }));

  await csvWriter.writeRecords(csvData);
  return filePath;
};

// Export members to CSV
const exportMembersCSV = async (members, filePath) => {
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'role', title: 'Role' },
      { id: 'dob', title: 'Date of Birth' },
      { id: 'createdAt', title: 'Member Since' },
    ],
  });

  const csvData = members.map((member) => ({
    name: member.name,
    email: member.email,
    phone: member.phone || 'N/A',
    role: member.role,
    dob: member.dob ? member.dob.toISOString().split('T')[0] : 'N/A',
    createdAt: member.createdAt.toISOString().split('T')[0],
  }));

  await csvWriter.writeRecords(csvData);
  return filePath;
};

module.exports = {
  exportAttendanceCSV,
  exportMembersCSV,
};

