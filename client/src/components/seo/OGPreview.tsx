//just another test for Open Graph Preview in the ui 

import React from 'react';
import Head from 'next/head';

const OGPreview = () => {
  const [ogData, setOgData] = React.useState({
    title: '',
    description: '',
    image: '',
    url: '',
  });

  React.useEffect(() => {
    const title = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const description = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const image = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    const url = document.querySelector('meta[property="og:url"]')?.getAttribute('content') || '';

    setOgData({ title, description, image, url });
  }, []);

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 font-bold text-sm text-gray-600">Open Graph Preview</div>
      <div className="p-4">
        {ogData.image && (
          <img src={ogData.image} alt="OG Image" className="w-full h-48 object-cover mb-2 rounded" />
        )}
        <h2 className="text-lg font-bold text-blue-600 mb-1">{ogData.title}</h2>
        <p className="text-sm text-gray-600 mb-1">{ogData.description}</p>
        <p className="text-xs text-gray-400">{ogData.url}</p>
      </div>
    </div>
  );
};

export default OGPreview;