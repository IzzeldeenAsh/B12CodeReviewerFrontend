import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { SeverityBadge } from '@/components/data-display/SeverityBadge';
import { SafeCodeBlock } from '@/components/data-display/SafeCodeBlock';
import { formatConfidence } from '@/utils/format';
import type { FindingVM } from '@/types/view-models';

interface FindingCardProps {
  finding: FindingVM;
  selected: boolean;
  onToggle: (id: string, checked: boolean) => void;
}

/**
 * A single finding (§10). Shows a selection checkbox (disabled once published),
 * severity/category, location, and — expanded — explanation, evidence (via the
 * safe code viewer), and suggested fix. Nothing here publishes; selection only
 * stages a finding for the separate publish step.
 */
export function FindingCard({ finding, selected, onToggle }: FindingCardProps) {
  const location =
    finding.filePath !== null
      ? `${finding.filePath}${finding.lineNumber !== null ? `:${finding.lineNumber}` : ''}`
      : 'General (no file position)';

  return (
    <Accordion variant="outlined" disableGutters sx={{ '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-label={`Finding: ${finding.title}`}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', minWidth: 0 }}>
          <Box onClick={(e) => e.stopPropagation()} onFocus={(e) => e.stopPropagation()}>
            <Tooltip title={finding.isPublished ? 'Already published' : 'Select for publication'}>
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Checkbox
                    checked={selected || finding.isPublished}
                    disabled={finding.isPublished}
                    onChange={(e) => onToggle(finding.id, e.target.checked)}
                    inputProps={{ 'aria-label': `Select finding: ${finding.title}` }}
                  />
                }
                label=""
              />
            </Tooltip>
          </Box>
          <SeverityBadge severity={finding.severity} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {finding.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {location}
            </Typography>
          </Box>
          {finding.isPublished && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Published"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={finding.category} size="small" variant="outlined" />
            <Chip
              label={finding.isInline ? 'Posts inline' : 'Posts as general comment'}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Confidence ${formatConfidence(finding.confidence)}`}
              size="small"
              variant="outlined"
            />
          </Box>

          <Section title="Explanation">{finding.explanation}</Section>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Evidence
            </Typography>
            <SafeCodeBlock code={finding.evidence} aria-label="Finding evidence" />
          </Box>

          {finding.suggestedFix && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Suggested fix
              </Typography>
              <SafeCodeBlock code={finding.suggestedFix} aria-label="Suggested fix" />
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
        {children}
      </Typography>
    </Box>
  );
}
