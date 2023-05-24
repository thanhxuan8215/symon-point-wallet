import * as fs from 'fs';

export function updateProperty(path: string, property: string, propertyContent: string) {
  if (!fs.existsSync(path)) {
    throw new Error('Path does not exist.');
  }

  const fileContent = fs.readFileSync(path, 'utf-8');
  if (!fileContent) {
    throw new Error('File content does not exist.');
  }

  const jsonContent = JSON.parse(fileContent);
  if (jsonContent[property] === undefined) {
    throw new Error('Property does not exist.');
  }

  jsonContent[property] = propertyContent;
  fs.writeFileSync(path, JSON.stringify(jsonContent, null, 2));
}

export function getProperty(path: string, property: string) {
  if (!fs.existsSync(path)) {
    throw new Error('File does not exist.');
  }

  const fileContent = fs.readFileSync(path, 'utf-8');
  if (!fileContent) {
    throw new Error('File content does not exist.');
  }

  const data = JSON.parse(fileContent);

  return data[property]
}
