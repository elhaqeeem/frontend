{isCoursesLoading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, index) => ( // Create 5 skeletons
            <div key={index} className="card card-compact bg-base-50 w-50 shadow-xl">
                <div className="h-64 skeleton"></div> {/* Skeleton for image */}
                <div className="card-body bg-white">
                    <h2 className="skeleton text-xl">
                        </h2> {/* Skeleton for title */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="skeleton h-10 w-20"></div> {/* Skeleton for price */}
                        </div>
                        <div className="skeleton h-10 w-10"></div> {/* Skeleton for button */}
                    </div>
                </div>
            </div>
        ))}
    </div>
) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {courses.map((course) => {
            // Gunakan public ID dari path_image untuk membuat gambar
            const publicId = course.path_image.split('/').slice(-2).join('/'); // Ambil public ID
            const myImage = cld.image(publicId); // Ambil path_image dari API (hanya public ID)

            myImage
                .resize(scale().width(1000)) // Resize gambar sesuai kebutuhan
                .delivery(quality('auto:low')) // Optimasi kualitas otomatis
                .delivery(format('auto')); // Pilih format gambar otomatis

            return (
                <div key={course.id} className="card card-compact bg-base-50 w-50 shadow-xl">
                    {course.discount > 0 && (
                        <div style={styles.watermark}>
                            Disc: {course.discount}%
                        </div>
                    )}

                    <figure>
                        {/* Tampilkan gambar yang sudah di-resize menggunakan AdvancedImage */}
                        <AdvancedImage
                            cldImg={myImage}
                            alt={course.title}
                            className="object-cover h-64 w-full"
                        />
                    </figure>

                    <div className="card-body bg-white">
                        <h2 className="card-title">{course.title}</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <button className="btn btn-outline btn-secondary">
                                    Rp. {Number(course.harga - (course.harga * (course.discount / 100))).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }).replace('Rp', '')}
                                </button>
                            </div>
                            <button
                                className="btn btn-circle btn-accent"
                                onClick={() => handleLearnMore(course)}
                            >
                                <i className="fa fa-cart-plus" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
)}