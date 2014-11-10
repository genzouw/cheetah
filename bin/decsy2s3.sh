#!/bin/bash -u
set -e

project_home="/var/cheetah"
shared_dir="${project_home}/shared_dir/products"
output_dir="${project_home}/output_dir/products"
backup_dir="${project_home}/backup_dir/products"
# s3_output_dir="s3://daito-lead-time-info/products"
s3_output_dir="s3://daito-sandbox/products"

[ ! -d "${output_dir}" ] && mkdir -p "${output_dir}"
[ ! -d "${backup_dir}" ] && mkdir -p "${backup_dir}"

echo "[$(date +"%Y-%m-%d %H:%M")] start."
find ${shared_dir} -type f -iname '*.csv' | grep '[0-9]\{8\}\-[0-9]\{4\}.csv' | sort | head -n 1 | while read csvfile; do
	endfile="${csvfile}.end"

	if [[ ! -f "${endfile}" ]]; then
		continue;
	fi

	echo "[$(date +"%Y-%m-%d %H:%M")] end file exist.($(echo $endfile))"

	rm -f "${output_dir}/*.json"

	update_date=$(date -d "$(basename "${csvfile}" | sed 's#\(.\{4\}\)\(.\{2\}\)\(.\{2\}\)\-\(.\{2\}\)\(.\{2\}\)\.csv#\1/\2/\3 \4:\5#g')" +"%m/%d(%a) %H:%M")
	echo "{ \"update_date\":\"${update_date}\" }" > "${output_dir}/update_date.json"

	head=$(head -n 1 "${csvfile}")

	cat "${csvfile}" | tail -n +2 | while read l; do
		tmpfile=$(mktemp)
		(echo "${head}"; echo "${l}";) | /usr/bin/csv2json > "${tmpfile}"
		product_no=$(cat "${tmpfile}" | /usr/bin/jq -r --compact-output '.[]|.["商品番号"]')
		cat "${tmpfile}" | /usr/bin/jq --compact-output '.[]|.["商品番号"]|=tonumber|.["入荷予定区分"]|="z"+.|.["在庫時入荷予定区分"]|="z"+.|.' > "${output_dir}/${product_no}.json"
		rm "${tmpfile}"
	done

	echo "{ \"update_date\":\"${update_date}\" }" > "${output_dir}/update_date.json"

	echo "[$(date +"%Y-%m-%d %H:%M")] start sync."

	/usr/local/bin/s3cmd sync --acl-public "${output_dir}/"*.json "${s3_output_dir}/"

	echo "[$(date +"%Y-%m-%d %H:%M")] end sync."

	mv "${csvfile}"{,.end} "${backup_dir}/"
done
echo "[$(date +"%Y-%m-%d %H:%M")] end."
