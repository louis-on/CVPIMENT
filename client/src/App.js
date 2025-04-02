import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Tab } from '@headlessui/react';
import axios from 'axios';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFViewer } from '@react-pdf/renderer';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#1a365d',
  },
  personalInfo: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '1 solid #e2e8f0',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a365d',
  },
  jobTitle: {
    fontSize: 18,
    color: '#2d3748',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#2d3748',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 10,
  },
  experienceItem: {
    marginBottom: 15,
  },
  experienceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  experienceSubtitle: {
    fontSize: 12,
    color: '#4a5568',
    marginBottom: 3,
  },
  experienceDate: {
    fontSize: 10,
    color: '#718096',
    marginBottom: 3,
  },
  experienceDescription: {
    fontSize: 11,
    marginBottom: 5,
  },
});

// PDF Document Component
const CVPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <View style={styles.personalInfo}>
          <Text style={styles.name}>
            {data.personalInfo?.firstName || ''} {data.personalInfo?.lastName || ''}
          </Text>
          <Text style={styles.jobTitle}>{data.personalInfo?.jobTitle || ''}</Text>
          {data.personalInfo?.synonymousTitles?.length > 0 && (
            <Text style={styles.text}>
              Alternative titles: {data.personalInfo.synonymousTitles.join(', ')}
            </Text>
          )}
          {data.personalInfo?.interests?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              {data.personalInfo.interests.map((interest, index) => (
                <Text key={index} style={styles.listItem}>• {interest}</Text>
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          {data.skills?.map((skill, index) => (
            <Text key={index} style={styles.listItem}>• {skill}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {data.experiences?.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <Text style={styles.experienceTitle}>{exp.position}</Text>
              <Text style={styles.experienceSubtitle}>{exp.company}</Text>
              <Text style={styles.experienceDate}>{exp.period}</Text>
              <Text style={styles.experienceDescription}>{exp.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.degrees?.map((degree, index) => (
            <View key={index} style={styles.experienceItem}>
              <Text style={styles.experienceTitle}>{degree.degree}</Text>
              <Text style={styles.experienceSubtitle}>{degree.institution}</Text>
              <Text style={styles.experienceDate}>{degree.year}</Text>
              <Text style={styles.experienceDescription}>{degree.description}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function App() {
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState({
    personalInfo: false,
    skills: false,
    experiences: false,
    degrees: false
  });

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await axios.post('http://localhost:5000/api/extract-cv', formData);
      setExtractedData(response.data);
    } catch (err) {
      setError('Error processing CV. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleEdit = (section) => {
    setEditing(prev => ({ ...prev, [section]: true }));
  };

  const handleSave = (section) => {
    setEditing(prev => ({ ...prev, [section]: false }));
  };

  const handleAddItem = (section, item) => {
    setExtractedData(prev => ({
      ...prev,
      [section]: [...prev[section], item]
    }));
  };

  const handleRemoveItem = (section, index) => {
    setExtractedData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handleUpdateItem = (section, index, updatedItem) => {
    setExtractedData(prev => {
      // Handle personalInfo updates
      if (section === 'personalInfo') {
        return {
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            [index]: updatedItem
          }
        };
      }

      // Handle array updates (skills, experiences, degrees)
      if (Array.isArray(prev[section])) {
        return {
          ...prev,
          [section]: prev[section].map((item, i) => 
            i === index ? updatedItem : item
          )
        };
      }

      // Fallback for other cases
      return {
        ...prev,
        [section]: updatedItem
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            CV Extraction Platform
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Upload your CV and let AI extract the information for you
          </p>
        </div>

        <div className="mt-12">
          <div
            {...getRootProps()}
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
              isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
            }`}
          >
            <div className="space-y-1 text-center">
              <input {...getInputProps()} />
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload a file</span>
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF up to 5MB</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Processing your CV...</p>
          </div>
        )}

        {error && (
          <div className="mt-8 text-center text-red-600">
            {error}
          </div>
        )}

        {extractedData && (
          <div className="mt-8">
            <div className="flex justify-end mb-4">
              <PDFDownloadLink
                document={<CVPDF data={extractedData} />}
                fileName="cv.pdf"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {({ blob, url, loading, error }) =>
                  loading ? 'Generating PDF...' : 'Download CV as PDF'
                }
              </PDFDownloadLink>
            </div>
            <div className="flex gap-8">
              <div className="flex-1">
                <Tab.Group>
                  <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 shadow">
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                          'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2',
                          selected
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        )
                      }
                    >
                      Personal Info
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                          'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2',
                          selected
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        )
                      }
                    >
                      Skills
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                          'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2',
                          selected
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        )
                      }
                    >
                      Experiences
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                          'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2',
                          selected
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        )
                      }
                    >
                      Education
                    </Tab>
                  </Tab.List>
                  <Tab.Panels className="mt-2">
                    <Tab.Panel
                      className={classNames(
                        'rounded-xl bg-white p-3',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2'
                      )}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Personal Information</h2>
                        {!editing.personalInfo ? (
                          <button
                            onClick={() => handleEdit('personalInfo')}
                            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSave('personalInfo')}
                            className="px-3 py-1 text-sm text-green-600 hover:text-green-500"
                          >
                            Save
                          </button>
                        )}
                      </div>
                      {editing.personalInfo ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                              type="text"
                              value={extractedData.personalInfo.firstName}
                              onChange={(e) => handleUpdateItem('personalInfo', 'firstName', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                              type="text"
                              value={extractedData.personalInfo.lastName}
                              onChange={(e) => handleUpdateItem('personalInfo', 'lastName', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Job Title</label>
                            <input
                              type="text"
                              value={extractedData.personalInfo.jobTitle}
                              onChange={(e) => handleUpdateItem('personalInfo', 'jobTitle', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Synonymous Titles</label>
                            {extractedData.personalInfo.synonymousTitles.map((title, index) => (
                              <div key={index} className="flex items-center space-x-2 mt-2">
                                <input
                                  type="text"
                                  value={title}
                                  onChange={(e) => {
                                    const newTitles = [...extractedData.personalInfo.synonymousTitles];
                                    newTitles[index] = e.target.value;
                                    handleUpdateItem('personalInfo', 'synonymousTitles', newTitles);
                                  }}
                                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <button
                                  onClick={() => {
                                    const newTitles = extractedData.personalInfo.synonymousTitles.filter((_, i) => i !== index);
                                    handleUpdateItem('personalInfo', 'synonymousTitles', newTitles);
                                  }}
                                  className="text-red-600 hover:text-red-500"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newTitles = [...extractedData.personalInfo.synonymousTitles, ''];
                                handleUpdateItem('personalInfo', 'synonymousTitles', newTitles);
                              }}
                              className="mt-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500 border border-indigo-600 rounded-md"
                            >
                              Add Title
                            </button>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Interests</label>
                            {extractedData.personalInfo.interests.map((interest, index) => (
                              <div key={index} className="flex items-center space-x-2 mt-2">
                                <input
                                  type="text"
                                  value={interest}
                                  onChange={(e) => {
                                    const newInterests = [...extractedData.personalInfo.interests];
                                    newInterests[index] = e.target.value;
                                    handleUpdateItem('personalInfo', 'interests', newInterests);
                                  }}
                                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <button
                                  onClick={() => {
                                    const newInterests = extractedData.personalInfo.interests.filter((_, i) => i !== index);
                                    handleUpdateItem('personalInfo', 'interests', newInterests);
                                  }}
                                  className="text-red-600 hover:text-red-500"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newInterests = [...extractedData.personalInfo.interests, ''];
                                handleUpdateItem('personalInfo', 'interests', newInterests);
                              }}
                              className="mt-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500 border border-indigo-600 rounded-md"
                            >
                              Add Interest
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-medium">{extractedData.personalInfo.firstName} {extractedData.personalInfo.lastName}</h3>
                            <p className="text-gray-600">{extractedData.personalInfo.jobTitle}</p>
                            {extractedData.personalInfo.synonymousTitles.length > 0 && (
                              <p className="text-sm text-gray-500 mt-1">
                                Alternative titles: {extractedData.personalInfo.synonymousTitles.join(', ')}
                              </p>
                            )}
                          </div>
                          {extractedData.personalInfo.interests.length > 0 && (
                            <div>
                              <h3 className="text-sm font-medium text-gray-700">Interests</h3>
                              <ul className="mt-2 space-y-1">
                                {extractedData.personalInfo.interests.map((interest, index) => (
                                  <li key={index} className="text-sm text-gray-600">• {interest}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </Tab.Panel>
                    <Tab.Panel
                      className={classNames(
                        'rounded-xl bg-white p-3',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2'
                      )}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Skills</h2>
                        {!editing.skills ? (
                          <button
                            onClick={() => handleEdit('skills')}
                            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSave('skills')}
                            className="px-3 py-1 text-sm text-green-600 hover:text-green-500"
                          >
                            Save
                          </button>
                        )}
                      </div>
                      {editing.skills ? (
                        <div className="space-y-2">
                          {extractedData.skills.map((skill, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={skill}
                                onChange={(e) => {
                                  const newSkills = [...extractedData.skills];
                                  newSkills[index] = e.target.value;
                                  setExtractedData(prev => ({ ...prev, skills: newSkills }));
                                }}
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              />
                              <button
                                onClick={() => handleRemoveItem('skills', index)}
                                className="text-red-600 hover:text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => handleAddItem('skills', '')}
                            className="mt-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500 border border-indigo-600 rounded-md"
                          >
                            Add Skill
                          </button>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {extractedData.skills.map((skill, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                              <span>{skill}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Tab.Panel>
                    <Tab.Panel
                      className={classNames(
                        'rounded-xl bg-white p-3',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2'
                      )}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Experiences</h2>
                        {!editing.experiences ? (
                          <button
                            onClick={() => handleEdit('experiences')}
                            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSave('experiences')}
                            className="px-3 py-1 text-sm text-green-600 hover:text-green-500"
                          >
                            Save
                          </button>
                        )}
                      </div>
                      {editing.experiences ? (
                        <div className="space-y-4">
                          {extractedData.experiences.map((exp, index) => (
                            <div key={index} className="space-y-2 p-4 border rounded-md">
                              <input
                                type="text"
                                value={exp.position}
                                onChange={(e) => handleUpdateItem('experiences', index, { ...exp, position: e.target.value })}
                                placeholder="Position"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              />
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => handleUpdateItem('experiences', index, { ...exp, company: e.target.value })}
                                placeholder="Company"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              />
                              <input
                                type="text"
                                value={exp.period}
                                onChange={(e) => handleUpdateItem('experiences', index, { ...exp, period: e.target.value })}
                                placeholder="Period"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              />
                              <textarea
                                value={exp.description}
                                onChange={(e) => handleUpdateItem('experiences', index, { ...exp, description: e.target.value })}
                                placeholder="Description"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows="3"
                              />
                              <button
                                onClick={() => handleRemoveItem('experiences', index)}
                                className="text-red-600 hover:text-red-500"
                              >
                                Remove Experience
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => handleAddItem('experiences', { position: '', company: '', period: '', description: '' })}
                            className="mt-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500 border border-indigo-600 rounded-md"
                          >
                            Add Experience
                          </button>
                        </div>
                      ) : (
                        <ul className="space-y-4">
                          {extractedData.experiences.map((exp, index) => (
                            <li key={index} className="border-l-4 border-indigo-600 pl-4">
                              <h3 className="font-medium">{exp.position}</h3>
                              <p className="text-gray-600">{exp.company}</p>
                              <p className="text-sm text-gray-500">{exp.period}</p>
                              <p className="mt-2">{exp.description}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Tab.Panel>
                    <Tab.Panel
                      className={classNames(
                        'rounded-xl bg-white p-3',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2'
                      )}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Education</h2>
                        {!editing.degrees ? (
                          <button
                            onClick={() => handleEdit('degrees')}
                            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSave('degrees')}
                            className="px-3 py-1 text-sm text-green-600 hover:text-green-500"
                          >
                            Save
                          </button>
                        )}
                      </div>
                      {editing.degrees ? (
                        <div className="space-y-4">
                          {extractedData.degrees.map((degree, index) => (
                            <div key={index} className="space-y-2 p-4 border rounded-md">
                              <input
                                type="text"
                                value={degree.degree}
                                onChange={(e) => handleUpdateItem('degrees', index, { ...degree, degree: e.target.value })}
                                placeholder="Degree"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              />
                              <input
                                type="text"
                                value={degree.institution}
                                onChange={(e) => handleUpdateItem('degrees', index, { ...degree, institution: e.target.value })}
                                placeholder="Institution"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              />
                              <input
                                type="text"
                                value={degree.year}
                                onChange={(e) => handleUpdateItem('degrees', index, { ...degree, year: e.target.value })}
                                placeholder="Year"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              />
                              <textarea
                                value={degree.description}
                                onChange={(e) => handleUpdateItem('degrees', index, { ...degree, description: e.target.value })}
                                placeholder="Description"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows="3"
                              />
                              <button
                                onClick={() => handleRemoveItem('degrees', index)}
                                className="text-red-600 hover:text-red-500"
                              >
                                Remove Degree
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => handleAddItem('degrees', { degree: '', institution: '', year: '', description: '' })}
                            className="mt-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500 border border-indigo-600 rounded-md"
                          >
                            Add Degree
                          </button>
                        </div>
                      ) : (
                        <ul className="space-y-4">
                          {extractedData.degrees.map((degree, index) => (
                            <li key={index} className="border-l-4 border-indigo-600 pl-4">
                              <h3 className="font-medium">{degree.degree}</h3>
                              <p className="text-gray-600">{degree.institution}</p>
                              <p className="text-sm text-gray-500">{degree.year}</p>
                              <p className="mt-2">{degree.description}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
              <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium text-gray-900">Live Preview</h2>
                </div>
                <div className="h-[800px] overflow-auto">
                  <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                    <CVPDF data={extractedData} />
                  </PDFViewer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 