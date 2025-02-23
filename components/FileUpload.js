import { useDropzone } from 'react-dropzone';

const FileUpload = ({ onFileUpload }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
    },
    onDrop: (acceptedFiles) => onFileUpload(acceptedFiles[0]),
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-600 hover:bg-gray-50 transition-colors"
    >
      <input {...getInputProps()} />
      <p className="text-gray-600">
        Drag & drop a resume (PDF/DOCX) here, or click to upload
      </p>
    </div>
  );
};

export default FileUpload;