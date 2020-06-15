import * as React from "react";

const icon_back = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuNWRHWFIAAAFKSURBVDhPY6AZ+A8EDKGrmKFc0gDPtv//5XcDDYjfzwEVIhLU/2eSAmqU3wU1IO0MF1SGCJB2hlV7z7//clt/Q/C2P/8liTYAqDn+8Pf/0ss+oWC5bX8x8cYfB+VWfc6Vm/tCCRhSjEBn72fJOfj5v/j050RhsRkvrknMeNEuNeulAdgA4eprK4Vqrv4Xqr2GH1dd+S/ceOu/SNeDayKd99pFu+5DDOCtuCYs1nTzqHDz7f/oWKr9DgaWbr19TarldrtUy00DYFwDvQAEYq13xWU67x4Dmvofhrlb7/3X670/QW/qvT5krDvtQbbO1Hv2VpMfSoE1w4BIywNJ2UkPj4v1P/4Pw5L1T0mIRiCQmPhMVGryk4Pi018AA+zFf8mZJBoAAkBNItKzXh6TWvaGPANAQGTGK0m1llcF8vPvk5iUkQEshGkLGBgADLf8U4fFVOgAAAAASUVORK5CYII=';
const icon_file = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAOCAYAAAAbvf3sAAAAYUlEQVR4nGNkYGBgqKmp+c+AB7S0tDCiCNTU1PzHBdavX/8f2UAmfCbDgLGxMdwVRGlA1sRCSGFAQACcffbsWeJtgAE6afj+/TtRir9//z5o/UAKYGRgYGAoLi7Gm/iQAQC+qjWGF5ecJwAAAABJRU5ErkJggg==";
const icon_folder = "data:image/gif;base64,R0lGODlhEAAOALMIAJdaH+C6eJ9oJMOHNK1zLf/inv/Sg////////wAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAAgALAAAAAAQAA4AAARAEMlJq7136IEnOeBBdENhGkGwadQQviE3lWZtAxRhE3zvIzpT0HYaCQwGAnLJHCEASabU+VRKl1SJYMvtdr6ICAA7";

const Folder = React.memo(({store}) => {
  return (
    <>
      <h4>Index of {store.dir}</h4>

      <table>
        <tbody>
        {store.isRoot && (
          <tr>
            <td>
              <img src={icon_back} alt="[../]"/>
            </td>
            <td>
              <a style={{
                textDecoration: 'none',
              }} href={'../'}>../</a>
            </td>
            <td/>
            <td/>
          </tr>
        )}
        {store.files.map((file) => {
          return (
            <tr>
              <td data-alt={`[${file.type}]`}>
                <img src={getIcon(file.type)} alt=""/>
              </td>
              <td>
                <a href={file.url}>{file.name}</a>
              </td>
              <td>{file.ctimeStr}</td>
              <td>{file.size}</td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </>
  );
});

function getIcon( type ) {
  switch (type) {
    case "dir":
      return icon_folder;
    default:
      return icon_file;
  }
}

export default Folder;