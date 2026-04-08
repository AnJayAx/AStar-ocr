// object type of images to be posted to backend in general
// when a user submits a form, the images should be posted as well
export interface IImageItem {
        "Image_ID": number,
        "Display_ID": string,
        "Creator": string,
        "Creation_Time": string,
        "Edit_Time": string,
        "Availability": number,
        "Status": string,
        "Type": string,
        "TransactionNo": string,
        "ImageContent": string
}