import React from "react"
import { Device, AttributeConfig, GridWidgetStore, DeviceIdentifier, DeviceConfig, gridSlice, CommandConfig } from "./GridWidget"
import { mergeComp } from "./comparators"
import Typography from "@material-ui/core/Typography"
import Divider from "@material-ui/core/Divider"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Table from "@material-ui/core/Table"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import TableCell from "@material-ui/core/TableCell"
import TableBody from "@material-ui/core/TableBody"
import SettingsIcon from '@material-ui/icons/Settings';
import CheckIcon from '@material-ui/icons/Check';
import IconButton from "@material-ui/core/IconButton"
import { Checkbox, Input } from "@material-ui/core"
import _ from "lodash"
import { useSelector, useDispatch } from "react-redux"
import { generate } from 'shortid';
import {headerStyle} from "./utils/header/style";
import {CloseButton} from "./utils/header/CloseButton";

export declare interface DeviceWidgetProps {
  device: Device,
  color: string
}

export function DeviceWidget(props: DeviceWidgetProps) {

  const {device, color} = props

  const plots = useSelector((state: GridWidgetStore) => state.general.plots)
  const config = useSelector((state: GridWidgetStore) => state.config.devices)
  const dispatch = useDispatch()
  const {applyDiff, createNewPlot, removeDevice, runCommand} = gridSlice.actions

  const [configMode, setConfigMode] = React.useState<boolean>(false)

  const [attrsDiff, setAttrsDiff] = React.useState<Array<DeviceConfig>>([])

  const getDeviceConfig = (name: DeviceIdentifier): DeviceConfig => {
    const baseConfig = config.find(dev => _.isEqual(name, dev.name)) || {name, commands: [], attributes: []}
    const diffConfig = attrsDiff.find(dev => _.isEqual(name, dev.name)) || {name, commands: [], attributes: []}
    return _.mergeWith(baseConfig, diffConfig, mergeComp)
  }

  const getAttrConfig = (name: string): AttributeConfig => {
    const devConfig = getDeviceConfig(device.name)
    return devConfig.attributes.find(attr => _.isEqual(attr.name, name)) || {name}
  }

  const getCmdConfig = (name: string): CommandConfig => {
    const devConfig = getDeviceConfig(device.name)
    return devConfig.commands.find(cmd => _.isEqual(cmd.name, name)) || {name}
  }

  const configButton = <>
      {configMode?
          <IconButton onClick={() => {
            dispatch(applyDiff({
              config: {
                devices: attrsDiff
              }
            }))
            setAttrsDiff([])
            setConfigMode(!configMode)}}>
              <CheckIcon/>
          </IconButton>
        :
          <IconButton onClick={() => setConfigMode(!configMode)}>
            <SettingsIcon/>
          </IconButton>
      }
    </>

    return <> 
      <div style={{...headerStyle, backgroundColor: color}}>
        <Typography>
          <b>{`${device.name.host}/${device.name.device} (${device.state})`}</b>
          {configButton}
          <CloseButton onClose={() => dispatch(removeDevice(device))}/>
        </Typography>
      </div>
      <Divider/>
      <div style={{overflow: "auto", height: `calc(100% - 48px)`}}>
          {
              configMode ?
                  <>
                      <Table size="small" aria-label="a dense table">
                          <TableHead>
                              <TableRow>
                                  <TableCell><b>Attribute</b></TableCell>
                                  <TableCell>Show</TableCell>
                                  <TableCell>Polling Period (ms)</TableCell>
                                  <TableCell>Plot</TableCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {(device.attributes || []).map(attr => {
                                  return <TableRow key={attr.name}>
                                      <TableCell>{attr.name}</TableCell>
                                      <TableCell>
                                          <Checkbox
                                              checked={Boolean(getAttrConfig(attr.name).show)}
                                              onChange={e => {
                                                  const diff = _.mergeWith(attrsDiff, [
                                                      {
                                                          name: device.name,
                                                          attributes: [{name: attr.name, show: e.target.checked}],
                                                      }
                                                  ], mergeComp)
                                                  setAttrsDiff(_.cloneDeep(diff))
                                              }}/>
                                      </TableCell>
                                      <TableCell>
                                          <Input type="number" value={getAttrConfig(attr.name).pollingPeriodS}
                                                 onChange={e => {
                                                     const diff = _.mergeWith(attrsDiff, [
                                                         {
                                                             name: device.name,
                                                             attributes: [{
                                                                 name: attr.name,
                                                                 pollingPeriodS: e.target.value
                                                             }],
                                                         }
                                                     ], mergeComp)
                                                     setAttrsDiff(_.cloneDeep(diff))
                                                 }}
                                          />
                                      </TableCell>
                                      <TableCell>
                                          <Select
                                              value={getAttrConfig(attr.name).displayPlot || "None"}
                                              onChange={(e) => {

                                                  const plotId = e.target.value === "new" ? generate() : e.target.value as string

                                                  if (e.target.value === "new") {
                                                      dispatch(createNewPlot(plotId))
                                                  }

                                                  const diff = _.mergeWith(attrsDiff, [
                                                      {
                                                          name: device.name,
                                                          attributes: [{name: attr.name, displayPlot: plotId}],
                                                      }
                                                  ], mergeComp)
                                                  setAttrsDiff(_.cloneDeep(diff))
                                              }}>
                                              <MenuItem value={"None"}>None</MenuItem>
                                              {
                                                  (plots || []).map(item => {
                                                      return <MenuItem key={item.name}
                                                                       value={item.id}>{item.name}</MenuItem>
                                                  })
                                              }
                                              <MenuItem value={"new"}>Create new Plot</MenuItem>
                                          </Select>
                                      </TableCell>
                                  </TableRow>
                              })
                              }

                          </TableBody>
                      </Table>
                      <Table size="small" aria-label="a dense table">
                          <TableHead>
                              <TableRow>
                                  <TableCell><b>Command</b></TableCell>
                                  <TableCell>Show</TableCell>
                                  <TableCell/>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {(device.commands || [])
                                  .map(cmd => {
                                      return <TableRow key={cmd.name}>
                                          <TableCell>{cmd.name}</TableCell>
                                          <TableCell>
                                              <Checkbox
                                                  checked={Boolean(getCmdConfig(cmd.name).show)}
                                                  onChange={e => {
                                                      const diff = _.mergeWith(attrsDiff, [
                                                          {
                                                              name: device.name,
                                                              commands: [{name: cmd.name, show: e.target.checked}],
                                                          }
                                                      ], mergeComp)
                                                      setAttrsDiff(_.cloneDeep(diff))
                                                  }}/>
                                          </TableCell>
                                          <TableCell>
                                          </TableCell>
                                      </TableRow>
                                  })
                              }
                          </TableBody>
                      </Table>
                  </>
                  :
                  <>
                      <Table size="small">
                          <TableHead>
                              <TableRow>
                                  <TableCell><b>Attribute</b></TableCell>
                                  <TableCell align="center" style={{
                                      whiteSpace: "pre", fontFamily: "monospace", fontSize: "large"
                                  }}>{"Value".padStart(10, ' ')}</TableCell>
                                  {/*<TableCell align="center">Value</TableCell>*/}
                                  <TableCell align="right"/>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {device.attributes
                                  .filter(attr => getAttrConfig(attr.name).show)
                                  .map(attr => <TableRow key={attr.name}>
                                          <TableCell component="th" scope="row">{attr.name}</TableCell>
                                          <TableCell align="center" style={{
                                              whiteSpace: "pre", fontFamily: "monospace", fontSize: "large"
                                          }}>{String(attr.value).padStart(14, ' ')}</TableCell>
                                          <TableCell align="right">
                                          </TableCell>
                                      </TableRow>
                                  )
                              }
                          </TableBody>
                      </Table>

                      <Table size="small" aria-label="a dense table">
                          <TableHead>
                              <TableRow>
                                  <TableCell><b>Command</b></TableCell>
                                  <TableCell align="center"/>
                                  <TableCell align="right"/>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {(device.commands || [])
                                  .filter(cmd => getCmdConfig(cmd.name).show)
                                  .map(cmd => {
                                      return <TableRow key={cmd.name}>
                                          <TableCell component="th" scope="row">{cmd.name}</TableCell>
                                          <TableCell>
                                              <IconButton
                                                  onClick={() => dispatch(runCommand({
                                                      device: device.name,
                                                      command: cmd.name
                                                  }))}
                                              >
                                                  <PlayArrowIcon/>
                                              </IconButton>
                                          </TableCell>
                                          <TableCell>
                                          </TableCell>
                                      </TableRow>
                                  })
                              }
                          </TableBody>
                      </Table>
                  </>
          }
      </div>
    </>
}
