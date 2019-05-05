import React from 'react'
import {
	Platform,
	ScrollView,
	StyleSheet,
	View
} from 'react-native'
import {Text, Image, CardFloat, Container, Button, InputText} from '../components'
import {GREY_LIGHT, WHITE, WHITE05, WHITE_CALM} from '../constants/Colors'
import {HP10, HP100, HP2, HP20, HP5, HP80, WP1, WP10, WP100, WP2, WP20, WP25, WP4, WP50} from '../constants/Sizes'
import {times, map, reduce, forEach, slice} from 'lodash-es'
import {SEAT_BG_COLOR, SEAT_BORDER_COLOR, SEAT_TYPE} from '../constants/Airplane'

export default class HomeScreen extends React.Component {
	constructor(props) {
		super(props)
	}

	state = {
		seatBlocks: [
			[3, 2],
			[4, 3],
			[2, 3],
			[3, 4]
		],
		passengers: '30'
	}

	static navigationOptions = {
		headerTitle: (
			<View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
				<Image aspectRatio={315 / 85} imageStyle={{height: HP5}}
				       source={require('../assets/images/logo_text_invert.png')}/>
			</View>
		)
	}

	_autoCheckIn = (seatBlocks, passengers) => {
		const {totalMaxRow} = this._calculateTotalCabinSeat(seatBlocks)
		const seatBlockLength = seatBlocks.length
		const seats = []
		const seatBlocksWithPassenger = []
		let totalSeats = 1

		//Aisle Seats
		let seatType = SEAT_TYPE.AISLE
		let row = 0
		while (row < totalMaxRow) {
			const seatsInRow = seats[row] || []
			let lastIndexBlock = -1
			forEach(seatBlocks, (seatBlockProperties, i) => {
				const seatBlockCol = seatBlockProperties[0]
				const seatBlockRow = seatBlockProperties[1]
				if (row >= seatBlockRow) {
				} else if (i === 0) {
					seatsInRow[seatBlockCol - 1] = {
						type: seatType,
						number: totalSeats,
						passengerNumber: passengers > 0 ? totalSeats : 0
					}
					passengers--
					totalSeats++
				} else if (i !== 0 && i !== seatBlockLength - 1) {
					seatsInRow[lastIndexBlock + 1] = {
						type: seatType,
						number: totalSeats,
						passengerNumber: passengers > 0 ? totalSeats : 0
					}
					passengers--
					totalSeats++
					seatsInRow[lastIndexBlock + seatBlockCol] = {
						type: seatType,
						number: totalSeats,
						passengerNumber: passengers > 0 ? totalSeats : 0
					}
					passengers--
					totalSeats++
				} else {
					seatsInRow[lastIndexBlock + 1] = {
						type: seatType,
						number: totalSeats,
						passengerNumber: passengers > 0 ? totalSeats : 0
					}
					passengers--
					totalSeats++
				}
				lastIndexBlock += seatBlockCol
			})
			seats[row] = seatsInRow
			row++
		}

		//Window seat
		seatType = SEAT_TYPE.WINDOW
		row = 0
		while (row < totalMaxRow) {
			const seatsInRow = seats[row] || []
			let lastIndexBlock = -1
			forEach(seatBlocks, (seatBlockProperties, i) => {
				const seatBlockCol = seatBlockProperties[0]
				const seatBlockRow = seatBlockProperties[1]
				if (row >= seatBlockRow) {
				} else if (i === 0) {
					seatsInRow[0] = {type: seatType, number: totalSeats, passengerNumber: passengers > 0 ? totalSeats : 0}
					passengers--
					totalSeats++
				} else if (i === seatBlockLength - 1) {
					seatsInRow[lastIndexBlock + seatBlockCol] = {
						type: seatType,
						number: totalSeats,
						passengerNumber: passengers > 0 ? totalSeats : 0
					}
					passengers--
					totalSeats++
				}
				lastIndexBlock += seatBlockCol
			})
			seats[row] = seatsInRow
			row++
		}

		//Middle seat
		seatType = SEAT_TYPE.MIDDLE
		row = 0
		while (row < totalMaxRow) {
			const seatsInRow = seats[row] || []
			let lastIndexBlock = -1
			forEach(seatBlocks, (seatBlockProperties, i) => {
				const seatBlockCol = seatBlockProperties[0]
				const seatBlockRow = seatBlockProperties[1]
				if (row >= seatBlockRow) {
				} else if (seatBlockCol > 2) {
					for (let i = lastIndexBlock + 2; i < (lastIndexBlock + seatBlockCol); i++) {
						seatsInRow[i] = {type: seatType, number: totalSeats, passengerNumber: passengers > 0 ? totalSeats : 0}
						passengers--
						totalSeats++
					}
				}
				const slicedRow = slice(seatsInRow, lastIndexBlock + 1, lastIndexBlock + seatBlockCol + 1)
				const updatedBlock = seatBlocksWithPassenger[i] || []
				updatedBlock.push(slicedRow)
				seatBlocksWithPassenger[i] = updatedBlock
				lastIndexBlock += seatBlockCol
			})
			seats[row] = seatsInRow
			row++
		}
		return seatBlocksWithPassenger
	}

	_calculateTotalCabinSeat = (seatBlocks) => {
		return reduce(seatBlocks, (result, seat) => ({
			totalColumns: result.totalColumns + seat[0],
			totalSeat: result.totalSeat + (seat[0] * seat[1]),
			totalMaxRow: seat[1] > result.totalMaxRow ? seat[1] : result.totalMaxRow
		}), {totalColumns: 0, totalSeat: 0, totalMaxRow: 0})
	}

	render() {
		const {
			seatBlocks,
			passengers
		} = this.state
		const {totalColumns} = this._calculateTotalCabinSeat(seatBlocks)
		const wmaSeatsWithPassenger = this._autoCheckIn(seatBlocks, passengers)
		const widthOfSeat = (100 - (2 * seatBlocks.length)) / totalColumns
		return (
			<Container>
				<ScrollView contentContainerStyle={styles.contentContainer}>
					<View style={styles.airplaneHead}/>
					<View style={styles.airplane}>
						<View style={styles.airplaneCabin}>
							<View style={styles.airplaneCabinFront}>
								<Button icon={{name: 'edit', type: 'AntDesign'}} text='Seat Map'/>
							</View>
							<View style={styles.airplaneCabinSeparator}/>
							<View style={styles.airplaneCabinSeat}>
								{
									map(seatBlocks, (containerSeat, i) => {
										const totalColumnsInBlock = containerSeat[0]
										const totalRowsInBlock = containerSeat[1]
										const dimensionOfSeat = `${(100 / totalColumnsInBlock) - 1}%`
										return (
											<View
												key={i}
												style={[styles.airplaneSeatContainer, {width: `${widthOfSeat * totalColumnsInBlock}%`}]}
											>
												{
													times(totalRowsInBlock, (rowIndex) => {
														return (
															<View key={`${i}${rowIndex}`} style={styles.airplaneSeatRow}>
																{
																	times(totalColumnsInBlock, (colIndex) => {
																		const {type: seatType, passengerNumber} = wmaSeatsWithPassenger[i][rowIndex][colIndex]
																		return (
																			<View
																				key={`${i}${colIndex}`}
																				style={[styles.airplaneSeat, {width: dimensionOfSeat}]}
																			>
																				<View style={[styles.square, {
																					backgroundColor: SEAT_BG_COLOR[seatType],
																					borderColor: SEAT_BORDER_COLOR[seatType]
																				}]}>
																					{
																						passengerNumber > 0 &&
																						<Text size='tiny' type='Graduate' centered>{passengerNumber}</Text>
																					}
																				</View>
																			</View>
																		)
																	})
																}
															</View>
														)
													})
												}
											</View>
										)
									})
								}
							</View>
						</View>
					</View>
				</ScrollView>
				<CardFloat>
					<View style={{flexDirection: 'row'}}>
						<InputText
							label='Number of passengers'
							keyboardType='numeric'
							onChangeText={(passengers) => this.setState({passengers})}
							placeholder='0'
							size='massive'
							value={passengers}
							inputStyle={{textAlign: 'center'}}
						/>
					</View>
				</CardFloat>
			</Container>
		)
	}
}

const styles = StyleSheet.create({
	contentContainer: {
		padding: WP1
	},
	airplaneHead: {
		backgroundColor: WHITE05,
		height: WP50,
		borderTopRightRadius: WP100,
		borderTopLeftRadius: WP100,
		transform: [
			{scaleY: 2}
		]
	},
	airplane: {
		padding: WP2,
		borderTopRightRadius: WP20,
		borderTopLeftRadius: WP20,
		backgroundColor: WHITE05
	},
	airplaneCabin: {
		minHeight: HP80,
		padding: WP2,
		paddingVertical: WP4,
		borderTopRightRadius: WP20,
		borderTopLeftRadius: WP20,
		backgroundColor: WHITE
	},
	airplaneCabinSeparator: {
		width: '100%',
		height: 4,
		backgroundColor: WHITE_CALM,
		borderRadius: 4,
		marginVertical: WP4,
		borderTopWidth: 1,
		borderColor: GREY_LIGHT
	},
	airplaneCabinFront: {
		flexDirection: 'row',
		justifyContent: 'center'
	},
	airplaneCabinSeat: {
		flexDirection: 'row'
	},
	airplaneSeatRow: {
		justifyContent: 'space-around',
		width: '100%',
		flexDirection: 'row'
	},
	airplaneSeatContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginHorizontal: '1%'
	},
	airplaneSeat: {
		padding: 1
	},
	square: {
		width: '100%',
		aspectRatio: 1,
		borderRadius: 4,
		backgroundColor: WHITE_CALM,
		borderColor: GREY_LIGHT,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center'
	}
})
