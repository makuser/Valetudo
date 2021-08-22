import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormHelperText,
    Grid,
    MenuItem,
    Paper,
    Select,
    styled,
    Typography,
} from "@material-ui/core";
import React from "react";
import {
    Capability,
    useCleanZonePresetMutation,
    useRobotStatusQuery,
    useZonePresetsQuery,
} from "../api";

const StyledFormControl = styled(FormControl)({
    minWidth: 120,
});

const ZonePresets = (): JSX.Element => {
    const { data: status } = useRobotStatusQuery((status) => {
        return status.value;
    });
    const {
        data: zones,
        isLoading: isZonesLoading,
        isError,
    } = useZonePresetsQuery();
    const { isLoading: isCommandLoading, mutate: cleanZones } =
        useCleanZonePresetMutation({
            onSuccess() {
                setSelected("");
            },
        });
    const [selected, setSelected] = React.useState<string>("");
    const canClean = status === "idle" || status === "docked";

    const handleChange = React.useCallback(
        (event: React.ChangeEvent<{ value: unknown }>) => {
            setSelected(event.target.value as string);
        },
        []
    );

    const handleClean = React.useCallback(() => {
        if (selected === "" || !canClean) {
            return;
        }
        cleanZones(selected);
    }, [canClean, cleanZones, selected]);

    const body = React.useMemo(() => {
        if (isZonesLoading) {
            return (
                <Grid item>
                    <CircularProgress size={20} />
                </Grid>
            );
        }

        if (isError || zones === undefined) {
            return (
                <Grid item>
                    <Typography color="error">
                        Error loading {Capability.ZoneCleaning}
                    </Typography>
                </Grid>
            );
        }

        return (
            <>
                <Grid item>
                    <StyledFormControl>
                        <Select
                            value={selected}
                            onChange={handleChange}
                            displayEmpty
                            variant="standard"
                        >
                            <MenuItem value="">
                                <em>Zone</em>
                            </MenuItem>
                            {zones.map(({ name, id }) => {
                                return (
                                    <MenuItem key={id} value={id}>
                                        {name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                        {!canClean && selected !== "" && (
                            <FormHelperText>Can only start cleaning when idle</FormHelperText>
                        )}
                    </StyledFormControl>
                </Grid>
                <Grid item xs>
                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            disabled={!selected || isCommandLoading || !canClean}
                            onClick={handleClean}
                        >
                            Clean
                        </Button>
                    </Box>
                </Grid>
            </>
        );
    }, [
        canClean,
        handleChange,
        handleClean,
        isCommandLoading,
        isError,
        isZonesLoading,
        selected,
        zones,
    ]);

    return (
        <Paper>
            <Box px={2} py={1}>
                <Grid container direction="row" alignItems="center" spacing={1}>
                    <Grid item>
                        <Typography variant="subtitle1">Clean zone</Typography>
                    </Grid>
                    {body}
                </Grid>
            </Box>
        </Paper>
    );
};
export default ZonePresets;