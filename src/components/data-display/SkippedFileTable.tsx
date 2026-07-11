import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { SkippedFileVM } from '@/types/view-models';

/**
 * Accessible table of files excluded from a review with the reason (§6, §9).
 * File paths are untrusted text, rendered escaped by React.
 */
export function SkippedFileTable({ files }: { files: SkippedFileVM[] }) {
  if (files.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No files were skipped.
      </Typography>
    );
  }
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" aria-label="Skipped files">
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col">
              File
            </TableCell>
            <TableCell component="th" scope="col">
              Reason skipped
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.path}>
              <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {file.path}
              </TableCell>
              <TableCell>{file.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
