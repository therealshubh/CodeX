import React from 'react';
import { FiExternalLink } from 'lucide-react';
function Project() {
  return (
    <div>
      <h2>Project Title</h2>
      <p>Project Description</p>
      <a href='#' target='_blank' rel='noopener noreferrer'>View Live <FiExternalLink /></a>
    </div>
  );
}
export default Project;