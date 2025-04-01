import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Tab } from '@headlessui/react';
import axios from 'axios';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function App() {
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
                  <ul className="space-y-2">
                    {extractedData.skills.map((skill, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </Tab.Panel>
                <Tab.Panel
                  className={classNames(
                    'rounded-xl bg-white p-3',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2'
                  )}
                >
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
                </Tab.Panel>
                <Tab.Panel
                  className={classNames(
                    'rounded-xl bg-white p-3',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2'
                  )}
                >
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
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 