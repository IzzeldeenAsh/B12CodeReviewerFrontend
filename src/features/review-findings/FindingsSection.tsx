import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { EmptyState } from '@/components/feedback/EmptyState';
import { FINDING_CATEGORIES, type FindingCategory } from '@/types/domain';
import type { FindingVM } from '@/types/view-models';
import { filterFindings, groupFindings, publishableFindings, type GroupMode } from './selection';
import { FindingCard } from './FindingCard';

interface FindingsSectionProps {
  findings: FindingVM[];
  selectedIds: Set<string>;
  onToggle: (id: string, checked: boolean) => void;
  onSelectAllPublishable: () => void;
  onClearSelection: () => void;
}

/**
 * Findings list with grouping, category/selection filters, and bulk selection
 * controls (§10). Default selection is empty — nothing is auto-selected.
 */
export function FindingsSection({
  findings,
  selectedIds,
  onToggle,
  onSelectAllPublishable,
  onClearSelection,
}: FindingsSectionProps) {
  const [group, setGroup] = useState<GroupMode>('severity');
  const [category, setCategory] = useState<FindingCategory | 'ALL'>('ALL');
  const [selectedOnly, setSelectedOnly] = useState(false);

  const visible = useMemo(
    () => filterFindings(findings, { category, selectedOnly }, selectedIds),
    [findings, category, selectedOnly, selectedIds],
  );
  const groups = useMemo(() => groupFindings(visible, group), [visible, group]);
  const publishableCount = publishableFindings(findings).length;

  if (findings.length === 0) {
    return (
      <EmptyState
        title="No findings"
        description="The AI did not report any issues for this pull request."
      />
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ mb: 2, alignItems: { md: 'center' }, flexWrap: 'wrap' }}
      >
        <ToggleButtonGroup
          size="small"
          exclusive
          value={group}
          onChange={(_, value: GroupMode | null) => value && setGroup(value)}
          aria-label="Group findings by"
        >
          <ToggleButton value="severity">By severity</ToggleButton>
          <ToggleButton value="file">By file</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          label="Category"
          select
          size="small"
          value={category}
          onChange={(e) => setCategory(e.target.value as FindingCategory | 'ALL')}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="ALL">All categories</MenuItem>
          {FINDING_CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>

        <ToggleButton
          size="small"
          value="selectedOnly"
          selected={selectedOnly}
          onChange={() => setSelectedOnly((v) => !v)}
        >
          Selected only
        </ToggleButton>

        <Box sx={{ flex: 1 }} />

        <Button size="small" onClick={onSelectAllPublishable} disabled={publishableCount === 0}>
          Select all publishable ({publishableCount})
        </Button>
        <Button size="small" onClick={onClearSelection} disabled={selectedIds.size === 0}>
          Clear selection
        </Button>
      </Stack>

      {groups.length === 0 ? (
        <EmptyState title="No matching findings" description="Adjust the filters above." />
      ) : (
        <Box sx={{ display: 'grid', gap: 3 }}>
          {groups.map((g) => (
            <Box key={g.key} component="section" aria-label={g.label}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {g.label} ({g.findings.length})
              </Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                {g.findings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    selected={selectedIds.has(finding.id)}
                    onToggle={onToggle}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
